import { Inject, Injectable, Logger } from '@nestjs/common';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppSchema } from '../../domain/value-objects/OcppSchema';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';
import { OcppCallRequest } from '../dto/OcppProtocol';
import {
  buildBootNotificationResponse,
  buildFormationViolation,
  buildGenericError,
} from '../dto/OcppResponseBuilders';

/**
 * Use-Case: Handle BootNotification (OCPP 1.6 Compliant)
 */
@Injectable()
export class HandleBootNotification {
  private logger = new Logger('HandleBootNotification');

  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepository: IChargePointRepository,
  ) {}

  async execute(message: OcppCallRequest, context: OcppContext): Promise<any[]> {
    if (message.messageTypeId !== 2) {
      this.logger.error('BootNotification expects CALL (messageTypeId 2)');
      return buildGenericError(context.messageId, 'Expected CALL message type');
    }

    const validation = OcppSchema.validate('BootNotification', message.payload);
    if (!validation.valid) {
      this.logger.warn(`BootNotification validation failed: ${validation.errors?.join('; ')}`);
      return buildFormationViolation(
        context.messageId,
        validation.errors?.join('; ') || 'Schema validation failed',
      );
    }

    const chargePoint = await this.chargePointRepository.findByChargePointId(context.chargePointId);

    if (!chargePoint) {
      this.logger.warn(`ChargePoint not found: ${context.chargePointId}`);
      return buildGenericError(context.messageId, `ChargePoint ${context.chargePointId} not found`);
    }

    this.logger.log(`✅ BootNotification accepted from ${context.chargePointId}`);

    return buildBootNotificationResponse(context.messageId, 'Accepted', 900);
  }
}
