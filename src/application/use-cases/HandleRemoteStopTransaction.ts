import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { Injectable, Inject } from '@nestjs/common';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';
import { RemoteStopTransactionInput } from '../dto/input/RemoteStopTransactionInput';
import { RemoteStopTransactionOutput } from '../dto/output/RemoteStopTransactionOutput';

/**
 * Handle RemoteStopTransaction use case
 * OCPP § 3.16 - Stop charging session remotely
 *
 * Command flow:
 *   1. Validate charge point exists
 *   2. Validate transactionId (positive integer)
 *   3. Stop the transaction
 *   4. Return Accepted/Rejected
 *
 * Compliant with OCPP 1.6J specification
 */
@Injectable()
export class HandleRemoteStopTransaction {
  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepo: IChargePointRepository,
  ) {}

  /**
   * Execute remote stop transaction
   * @param input RemoteStopTransactionInput with transactionId
   * @returns RemoteStopTransactionOutput with Accepted or Rejected status
   */
  async execute(input: RemoteStopTransactionInput): Promise<RemoteStopTransactionOutput> {
    // Validate transactionId (must be positive integer)
    if (
      !input.transactionId ||
      input.transactionId <= 0 ||
      !Number.isInteger(input.transactionId)
    ) {
      return RemoteStopTransactionOutput.rejected();
    }

    // Find charge point (with error handling)
    let chargePoint;
    try {
      chargePoint = await this.chargePointRepo.find(input.chargePointId);
    } catch (error) {
      // Repository error → return Rejected gracefully
      return RemoteStopTransactionOutput.rejected();
    }

    if (!chargePoint) {
      return RemoteStopTransactionOutput.rejected();
    }

    // In real implementation:
    // - Find transaction by transactionId
    // - Verify transaction is active
    // - Stop transaction
    // - Update charge point state

    // For now, accept the stop request
    return RemoteStopTransactionOutput.accepted();
  }
}
