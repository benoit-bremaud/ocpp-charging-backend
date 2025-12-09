import { Injectable, BadRequestException } from '@nestjs/common';

/**
 * Strategy Pattern : Valider les messages OCPP
 * SOLID: S (Single Responsibility), O (Open/Closed - extensible)
 */
@Injectable()
export class OcppMessageValidator {
  /**
   * Valider un message OCPP brut [messageTypeId, messageId, action, payload]
   */
  validateOcppMessage(message: unknown): void {
    if (!Array.isArray(message) || message.length < 3) {
      throw new BadRequestException(
        'Invalid OCPP message format: must be array with at least 3 elements',
      );
    }

    const [messageTypeId, messageId, action] = message;

    if (![1, 2, 3, 4].includes(messageTypeId)) {
      throw new BadRequestException(`Invalid messageTypeId: ${messageTypeId}`);
    }

    if (typeof messageId !== 'string' || messageId.length === 0) {
      throw new BadRequestException('Invalid messageId: must be non-empty string');
    }

    if (typeof action !== 'string' || action.length === 0) {
      throw new BadRequestException('Invalid action: must be non-empty string');
    }
  }

  /**
   * Valider un ID de borne
   */
  validateChargePointId(chargePointId: string): void {
    if (!chargePointId || chargePointId.length === 0) {
      throw new BadRequestException('ChargePoint ID cannot be empty');
    }
  }

  /**
   * Valider un ID de transaction
   */
  validateTransactionId(transactionId: number): void {
    if (typeof transactionId !== 'number' || transactionId < 0) {
      throw new BadRequestException('Invalid transaction ID');
    }
  }
}
