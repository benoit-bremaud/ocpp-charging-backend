import { Inject, Injectable } from '@nestjs/common';
import { OcppMessage } from '../../domain/value-objects/OcppMessage';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';

/**
 * Use-Case: Handle OCPP BootNotification message.
 *
 * CLEAN: Application layer handles business logic for boot.
 * SOLID: DIP - depends on repository abstraction.
 *
 * OCPP Flow:
 * 1. ChargePoint sends BootNotification (after power-on)
 * 2. Backend marks ChargePoint as ONLINE
 * 3. Return BootNotificationResponse with interval
 */
@Injectable()
export class HandleBootNotification {
  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepository: IChargePointRepository,
  ) {}

  /**
   * Execute: handle BootNotification from ChargePoint.
   */
  async execute(message: OcppMessage): Promise<Record<string, any>> {
    if (!message.isCall()) {
      throw new Error('BootNotification handler expects CALL message');
    }

    const { chargePointId } = message.payload;

    if (!chargePointId) {
      return this.buildErrorResponse(
        message.messageId,
        'MissingChargePointId',
      );
    }

    // Find or create ChargePoint (for now, just find)
    const chargePoint =
      await this.chargePointRepository.findByChargePointId(chargePointId);

    if (!chargePoint) {
      return this.buildErrorResponse(
        message.messageId,
        'ChargePointNotFound',
      );
    }

    // Mark as ONLINE (update would go here in real implementation)
    console.log(
      `[HandleBootNotification] ChargePoint online: ${chargePointId}`,
    );

    // Return BootNotificationResponse [3, messageId, response]
    return [
      3,
      message.messageId,
      {
        currentTime: new Date().toISOString(),
        interval: 900, // Heartbeat interval in seconds
        status: 'Accepted', // Accepted | Pending | Rejected
      },
    ];
  }

  /**
   * Build error response.
   */
  private buildErrorResponse(
    messageId: string,
    errorCode: string,
  ): Record<string, any> {
    return [
      4,
      messageId,
      errorCode,
      `BootNotification failed: ${errorCode}`,
    ];
  }
}
