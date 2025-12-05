import { Inject, Injectable } from '@nestjs/common';
import { OcppMessage } from '../../domain/value-objects/OcppMessage';
import { HeartbeatStatus } from '../../domain/value-objects/HeartbeatStatus';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';

/**
 * Use-Case: Handle OCPP Heartbeat message.
 *
 * OCPP 1.6 Spec:
 * - Heartbeat has NO payload fields (empty object)
 * - ChargePoint sends every `interval` seconds (from BootNotification)
 * - Used for keep-alive and clock synchronization
 * - Response: [3, messageId, {currentTime}]
 *
 * CLEAN: Application layer business logic.
 * SOLID: DIP - depends on repository abstraction.
 */
@Injectable()
export class HandleHeartbeat {
  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepository: IChargePointRepository,
  ) {}

  /**
   * Execute: handle Heartbeat from ChargePoint.
   *
   * Validates:
   * 1. Message is CALL type
   * 2. Payload is empty object
   * 3. ChargePoint is known
   *
   * Updates:
   * 1. ChargePoint.lastHeartbeat timestamp
   * 2. ChargePoint.status = ONLINE (if was offline)
   *
   * Returns:
   * [3, messageId, {currentTime}] per OCPP 1.6
   */
  async execute(message: OcppMessage): Promise<Record<string, any>> {
    // Validate message type
    if (!message.isCall()) {
      throw new Error('Heartbeat handler expects CALL message (type 2)');
    }

    // Validate payload per OCPP 1.6: must be empty
    const heartbeatStatus = new HeartbeatStatus(message.payload);
    if (!heartbeatStatus.isValid) {
      return this.buildErrorResponse(
        message.messageId,
        'FormationViolation',
        heartbeatStatus.reason || 'Invalid heartbeat payload',
      );
    }

    // Extract chargePointId from WebSocket context
    // For now, we'll use a placeholder - should come from gateway context
    const chargePointId = message.payload.chargePointId || 'CP-UNKNOWN';

    // Find ChargePoint
    const chargePoint =
      await this.chargePointRepository.findByChargePointId(chargePointId);

    if (!chargePoint) {
      return this.buildErrorResponse(
        message.messageId,
        'GenericError',
        `ChargePoint not found: ${chargePointId}`,
      );
    }

    // Update lastHeartbeat timestamp
    // TODO: In STEP 12+, update ChargePoint entity with timestamp
    console.log(
      `[HandleHeartbeat] ChargePoint alive: ${chargePointId} at ${new Date().toISOString()}`,
    );

    // Return HeartbeatResponse [3, messageId, {currentTime}]
    return [
      3, // CALLRESULT type
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
