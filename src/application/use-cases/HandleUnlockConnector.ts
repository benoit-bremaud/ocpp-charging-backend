import { Injectable, Inject } from '@nestjs/common';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';
import { UnlockConnectorInput } from '../dto/input/UnlockConnectorInput';
import { UnlockConnectorOutput } from '../dto/output/UnlockConnectorOutput';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';

/**
 * Handle UnlockConnector use case
 * OCPP § 3.18 - Unlock specific connector
 */
@Injectable()
export class HandleUnlockConnector {
  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepo: IChargePointRepository,
  ) {}

  async execute(input: UnlockConnectorInput): Promise<UnlockConnectorOutput> {
    // Validate connectorId (must be >= 0, but NOT === 0 per OCPP spec)
    if (input.connectorId === undefined || input.connectorId === null || input.connectorId < 0) {
      return UnlockConnectorOutput.rejected();
    }

    const chargePoint = await this.chargePointRepo.find(input.chargePointId);
    if (!chargePoint) {
      return UnlockConnectorOutput.rejected();
    }

    return UnlockConnectorOutput.accepted();
  }
}
