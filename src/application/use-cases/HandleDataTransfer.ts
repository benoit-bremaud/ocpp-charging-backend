import { Injectable, Inject, Logger } from '@nestjs/common';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';
import { OcppCallRequest } from '../dto/OcppProtocol';
import {
  buildDataTransferResponse,
  buildFormationViolation,
  buildGenericError,
} from '../dto/OcppResponseBuilders';

/**
 * Use-Case: Handle DataTransfer (OCPP 1.6 Compliant)
 * OCPP § 2.28 - Generic data transfer between parties
 */
@Injectable()
export class HandleDataTransfer {
  private logger = new Logger('HandleDataTransfer');

  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepository: IChargePointRepository,
  ) {}

  async execute(message: OcppCallRequest, context: OcppContext): Promise<any> {
    // Validate messageTypeId is CALL (2)
    if (message.messageTypeId !== 2) {
      this.logger.error('DataTransfer expects CALL (messageTypeId 2)');
      return buildGenericError(context.messageId, 'Expected CALL message type');
    }

    // Basic validation - vendorId is required
    if (!message.payload || !message.payload.vendorId) {
      this.logger.warn('DataTransfer: missing required vendorId');
      return buildFormationViolation(context.messageId, 'Missing required field: vendorId');
    }

    // Lookup ChargePoint
    const chargePoint = await this.chargePointRepository.findByChargePointId(context.chargePointId);
    if (!chargePoint) {
      this.logger.warn(`ChargePoint not found: ${context.chargePointId}`);
      return buildGenericError(context.messageId, `ChargePoint ${context.chargePointId} not found`);
    }

    this.logger.log(
      `✅ DataTransfer accepted from ${context.chargePointId} with vendorId: ${message.payload.vendorId}`,
    );
    return buildDataTransferResponse(context.messageId, 'Accepted');
  }
}
