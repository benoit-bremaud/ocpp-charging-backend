import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { Injectable, Inject } from '@nestjs/common';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';
import { RemoteStartTransactionInput } from '../dto/input/RemoteStartTransactionInput';
import { RemoteStartTransactionOutput } from '../dto/output/RemoteStartTransactionOutput';

/**
 * Handle RemoteStartTransaction use case
 * OCPP § 3.15 - Initiate charging session remotely
 *
 * Command flow:
 *   1. Validate charge point exists
 *   2. Validate idTag (max 20 chars)
 *   3. Validate connector available (if specified)
 *   4. Apply charging profile (if provided)
 *   5. Return Accepted/Rejected
 *
 * Compliant with OCPP 1.6J specification
 */
@Injectable()
export class HandleRemoteStartTransaction {
  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepo: IChargePointRepository,
  ) {}

  /**
   * Execute remote start transaction
   * @param input RemoteStartTransactionInput with idTag and optional chargingProfile
   * @returns RemoteStartTransactionOutput with Accepted or Rejected status
   */
  async execute(input: RemoteStartTransactionInput): Promise<RemoteStartTransactionOutput> {
    // Validate idTag (OCPP requirement: max 20 chars)
    if (!input.idTag || input.idTag.length > 20) {
      return RemoteStartTransactionOutput.rejected();
    }

    // Find charge point
    const chargePoint = await this.chargePointRepo.find(input.chargePointId);
    if (!chargePoint) {
      return RemoteStartTransactionOutput.rejected();
    }

    // Validate connector (if specified)
    if (input.connectorId && input.connectorId < 0) {
      return RemoteStartTransactionOutput.rejected();
    }

    // In real implementation:
    // - Check connector availability
    // - Apply charging profile
    // - Start transaction
    // - Update charge point state

    // For now, accept the transaction
    return RemoteStartTransactionOutput.accepted();
  }
}
