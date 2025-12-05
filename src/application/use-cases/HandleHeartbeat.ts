import { Inject, Injectable } from '@nestjs/common';
import { OcppMessage } from '../../domain/value-objects/OcppMessage';
import { OcppSchema } from '../../domain/value-objects/OcppSchema';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';

/**
 * Use-Case: Handle OCPP Heartbeat message (OCPP 1.6 compliant).
 *
 * Validation pipeline:
 * 1. Message is CALL type (OcppMessage)
 * 2. Payload conforms to JSON schema (OcppSchema)
 * 3. ChargePoint exists in database
 *
 * Response: [3, messageId, {currentTime}] per OCPP 1.6
 *
 * CLEAN: Application layer orchestrates validation + business logic.
 * SOLID: DIP - depends on abstractions (OcppSchema, IChargePointRepository).
 */
@Injectable()
export class HandleHeartbeat {
  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepository: IChargePointRepository,
  ) {}

  /**
   * Execute: handle Heartbeat from ChargePoint.
   */
  async execute(message: OcppMessage): Promise<Record<string, any>> {
    // 1. Validate message type
    if (!message.isCall()) {
      throw new Error('Heartbeat handler expects CALL message (type 2)');
    }

    // 2. Validate payload against OCPP schema
    const schemaValidation = OcppSchema.validate('Heartbeat', message.payload);
    if (!schemaValidation.valid) {
      return this.buildErrorResponse(
        message.messageId,
        'FormationViolation',
        `Schema validation failed: ${schemaValidation.errors?.join('; ') || 'Unknown error'}`,
      );
    }

    // 3. ChargePoint lookup
    const chargePointId = message.payload.chargePointId || 'CP-UNKNOWN';
    const chargePoint =
      await this.chargePointRepository.findByChargePointId(chargePointId);

    if (!chargePoint) {
      return this.buildErrorResponse(
        message.messageId,
        'GenericError',
        `ChargePoint not found: ${chargePointId}`,
      );
    }

    // 4. Update timestamp
    console.log(
      `[HandleHeartbeat] ✅ ChargePoint alive: ${chargePointId} at ${new Date().toISOString()}`,
    );

    // 5. Return OCPP HeartbeatResponse
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
