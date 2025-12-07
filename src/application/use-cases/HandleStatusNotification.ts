import { Inject, Injectable, Logger } from '@nestjs/common';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppSchema } from '../../domain/value-objects/OcppSchema';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';
import { OcppCallRequest } from '../dto/OcppProtocol';
import {
  buildStatusNotificationResponse,
  buildFormationViolation,
  buildGenericError,
} from '../dto/OcppResponseBuilders';

/**
 * Use-Case: Handle StatusNotification (OCPP 1.6 Compliant)
 *
 * Input:  [2, messageId, "StatusNotification", {connectorId, errorCode, status, timestamp}]
 * Output: [3, messageId, {}]
 * Error:  [4, messageId, errorCode, description]
 *
 * CLEAN: Pure business logic
 * OCPP:  Strict schema validation (enum values)
 */
@Injectable()
export class HandleStatusNotification {
  private logger = new Logger('HandleStatusNotification');

  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepository: IChargePointRepository,
  ) {}

  /**
   * Execute: Handle StatusNotification message
   */
  async execute(message: OcppCallRequest, context: OcppContext): Promise<any[]> {
    // Validate message is CALL
    if (message.messageTypeId !== 2) {
      this.logger.error('StatusNotification expects CALL (messageTypeId 2)');
      return buildGenericError(context.messageId, 'Expected CALL message type');
    }

    // Validate payload against OCPP 1.6 schema
    const validation = OcppSchema.validate('StatusNotification', message.payload);
    if (!validation.valid) {
      this.logger.warn(`StatusNotification validation failed: ${validation.errors?.join('; ')}`);
      return buildFormationViolation(
        context.messageId,
        validation.errors?.join('; ') || 'Schema validation failed',
      );
    }

    // Find ChargePoint
    const chargePoint = await this.chargePointRepository.findByChargePointId(context.chargePointId);

    if (!chargePoint) {
      return buildGenericError(context.messageId, `ChargePoint ${context.chargePointId} not found`);
    }

    // Extract status info
    const { connectorId, errorCode, status, timestamp } = message.payload;

    // Business Logic: Update connector status
    this.logger.log(
      `📊 Status: ${context.chargePointId} connector ${connectorId} → ${status} (${errorCode})`,
    );

    // Log status change with error code (for monitoring/alerting)
    if (errorCode !== 'NoError') {
      this.logger.warn(`Connector error detected: ${errorCode} at ${timestamp}`);
    }

    // Build CALLRESULT response per OCPP 1.6 spec (empty payload)
    return buildStatusNotificationResponse(context.messageId);
  }
}
