import { Inject, Injectable, Logger } from '@nestjs/common';
import { OcppMessage } from '../../domain/value-objects/OcppMessage';
import { OcppSchema } from '../../domain/value-objects/OcppSchema';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';

/**
 * Use-Case: Handle OCPP StatusNotification message.
 *
 * OCPP 1.6 Spec:
 * - ChargePoint reports connector status change
 * - connectorId: connector identifier (0 = charger, 1+ = outlets)
 * - errorCode: error condition (NoError, ConnectorLockFailure, etc.)
 * - status: connector state (Available, Occupied, Reserved, Unavailable, Faulted)
 * - Response: [3, messageId, {}] (empty object)
 *
 * CLEAN: Application layer handles business logic.
 * SOLID: DIP - depends on repository abstraction.
 */
@Injectable()
export class HandleStatusNotification {
  private logger = new Logger('HandleStatusNotification');

  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepository: IChargePointRepository,
  ) {}

  /**
   * Execute: handle StatusNotification from ChargePoint.
   * 
   * @param message OCPP message
   * @param chargePointId From WebSocket query params
   */
  async execute(
    message: OcppMessage,
    chargePointId: string = 'CP-UNKNOWN',
  ): Promise<Record<string, any>> {
    if (!message.isCall()) {
      this.logger.error('StatusNotification handler expects CALL message');
      throw new Error('StatusNotification handler expects CALL message');
    }

    // Validate payload against OCPP schema
    const schemaValidation = OcppSchema.validate(
      'StatusNotification',
      message.payload,
    );
    if (!schemaValidation.valid) {
      this.logger.warn(
        `StatusNotification schema validation failed: ${schemaValidation.errors?.join('; ')}`,
      );
      return this.buildErrorResponse(
        message.messageId,
        'FormationViolation',
        `Schema validation failed: ${schemaValidation.errors?.join('; ') || 'Unknown error'}`,
      );
    }

    // Extract status info
    const { connectorId, errorCode, status, timestamp, vendorId, vendorErrorCode } =
      message.payload;

    // Find ChargePoint
    const chargePoint =
      await this.chargePointRepository.findByChargePointId(chargePointId);

    if (!chargePoint) {
      this.logger.warn(`ChargePoint not found: ${chargePointId}`);
      return this.buildErrorResponse(
        message.messageId,
        'GenericError',
        `ChargePoint not found: ${chargePointId}`,
      );
    }

    // Log status change
    this.logger.log(
      `📊 Status update: ${chargePointId} connector ${connectorId} → ${status} (${errorCode})`,
    );

    // TODO: In STEP 13+, update Connector entity
    // - Create/update Connector record
    // - Store status history
    // - Trigger frontend broadcasts

    // Return StatusNotificationResponse [3, messageId, {}]
    // Per OCPP 1.6: response is empty object
    return [3, message.messageId, {}];
  }

  /**
   * Build OCPP error response.
   */
  private buildErrorResponse(
    messageId: string,
    errorCode: string,
    errorDescription: string,
  ): Record<string, any> {
    return [4, messageId, errorCode, errorDescription];
  }
}
