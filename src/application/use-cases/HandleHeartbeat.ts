import { Inject, Injectable, Logger } from '@nestjs/common';
import { OcppMessage } from '../../domain/value-objects/OcppMessage';
import { OcppSchema } from '../../domain/value-objects/OcppSchema';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';

/**
 * Use-Case: Handle OCPP Heartbeat message.
 *
 * OCPP 1.6 Spec:
 * - Heartbeat has NO payload fields (empty object)
 * - Response: [3, messageId, {currentTime}]
 *
 * CLEAN: Application layer business logic.
 * SOLID: DIP - depends on repository abstraction.
 */
@Injectable()
export class HandleHeartbeat {
  private logger = new Logger('HandleHeartbeat');

  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepository: IChargePointRepository,
  ) {}

  /**
   * Execute: handle Heartbeat from ChargePoint.
   */
  async execute(message: OcppMessage): Promise<Record<string, any>> {
    if (!message.isCall()) {
      this.logger.error('Heartbeat handler expects CALL message (type 2)');
      throw new Error('Heartbeat handler expects CALL message (type 2)');
    }

    // Validate payload against OCPP schema (must be empty)
    const schemaValidation = OcppSchema.validate('Heartbeat', message.payload);
    if (!schemaValidation.valid) {
      this.logger.warn(
        `Heartbeat schema validation failed: ${schemaValidation.errors?.join('; ')}`,
      );
      return this.buildErrorResponse(
        message.messageId,
        'FormationViolation',
        schemaValidation.errors?.join('; ') || 'Invalid heartbeat payload',
      );
    }

    // ChargePoint lookup
    const chargePointId = message.payload.chargePointId || 'CP-UNKNOWN';
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

    // Update lastHeartbeat timestamp
    this.logger.debug(
      `💓 Heartbeat received from ${chargePointId} at ${new Date().toISOString()}`,
    );

    // Return HeartbeatResponse [3, messageId, {currentTime}]
    return [
      3,
      message.messageId,
      {
        currentTime: new Date().toISOString(),
      },
    ];
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
