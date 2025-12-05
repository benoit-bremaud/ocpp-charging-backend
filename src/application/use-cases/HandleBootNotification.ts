import { Inject, Injectable, Logger } from '@nestjs/common';
import { OcppMessage } from '../../domain/value-objects/OcppMessage';
import { OcppSchema } from '../../domain/value-objects/OcppSchema';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';

/**
 * Use-Case: Handle OCPP BootNotification message.
 *
 * OCPP 1.6 Spec:
 * - ChargePoint announces itself after power-on
 * - Response: [3, messageId, {status, currentTime, interval}]
 *
 * CLEAN: Application layer handles business logic.
 * SOLID: DIP - depends on repository abstraction.
 */
@Injectable()
export class HandleBootNotification {
  private logger = new Logger('HandleBootNotification');

  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepository: IChargePointRepository,
  ) {}

  /**
   * Execute: handle BootNotification from ChargePoint.
   */
  async execute(message: OcppMessage): Promise<Record<string, any>> {
    if (!message.isCall()) {
      this.logger.error('BootNotification handler expects CALL message');
      throw new Error('BootNotification handler expects CALL message');
    }

    // Validate payload against OCPP schema
    const schemaValidation = OcppSchema.validate('BootNotification', message.payload);
    if (!schemaValidation.valid) {
      this.logger.warn(
        `BootNotification schema validation failed: ${schemaValidation.errors?.join('; ')}`,
      );
      return this.buildErrorResponse(
        message.messageId,
        'FormationViolation',
        `Schema validation failed: ${schemaValidation.errors?.join('; ') || 'Unknown error'}`,
      );
    }

    const { chargePointId } = message.payload;

    if (!chargePointId) {
      this.logger.warn('BootNotification missing chargePointId');
      return this.buildErrorResponse(
        message.messageId,
        'MissingChargePointId',
      );
    }

    // Find ChargePoint
    const chargePoint =
      await this.chargePointRepository.findByChargePointId(chargePointId);

    if (!chargePoint) {
      this.logger.warn(`ChargePoint not found: ${chargePointId}`);
      return this.buildErrorResponse(
        message.messageId,
        'ChargePointNotFound',
      );
    }

    // Mark as ONLINE
    this.logger.log(`✅ ChargePoint online: ${chargePointId}`);

    // Return BootNotificationResponse [3, messageId, response]
    return [
      3,
      message.messageId,
      {
        currentTime: new Date().toISOString(),
        interval: 900, // Heartbeat interval in seconds
        status: 'Accepted',
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
