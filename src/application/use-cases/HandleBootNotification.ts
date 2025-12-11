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
 * OCPP-First Handler : BootNotification
 * Single source of truth: domain/ocpp-messages/BootNotification
 */
@Injectable()
export class HandleBootNotification {
  private logger = new Logger(HandleBootNotification.name);

  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepository: IChargePointRepository,
  ) {}

  async execute(message: OcppCallRequest, context: OcppContext): Promise<unknown> {
    // ✅ Validate message type
    if (message.messageTypeId !== 2) {
      this.logger.error(
        `BootNotification expects CALL messageTypeId 2, got ${message.messageTypeId}`,
      );
      return buildGenericError(context.messageId, 'Expected CALL message type');
    }

    // ✅ Validate against OCPP JSON schema
    // const validation = OcppSchema.validateBootNotification(message.payload);
    const validation = OcppSchema.validate('BootNotification', message.payload);

    if (!validation.valid) {
      this.logger.warn(`BootNotification validation failed: ${validation.errors?.join(', ')}`);
      return buildFormationViolation(
        context.messageId,
        validation.errors?.join(', ') || 'Schema validation failed',
      );
    }

    const payload = message.payload as unknown as { chargePointVendor?: string };

    this.logger.log(
      `BootNotification received from chargePointId: ${context.chargePointId}, vendor: ${payload?.chargePointVendor || 'unknown'}`,
    );

    // ✅ Apply business logic
    const chargePoint = await this.chargePointRepository.findByChargePointId(context.chargePointId);

    if (!chargePoint) {
      this.logger.warn(`ChargePoint not found for chargePointId: ${context.chargePointId}`);
      return buildGenericError(context.messageId, `ChargePoint ${context.chargePointId} not found`);
    }

    this.logger.log(`BootNotification accepted for chargePointId: ${context.chargePointId}`);

    return buildBootNotificationResponse(context.messageId, 'Accepted', 900);
  }
}
