import { Injectable, Inject } from '@nestjs/common';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';
import { SetChargingProfileInput } from '../dto/input/SetChargingProfileInput';
import { SetChargingProfileOutput } from '../dto/output/SetChargingProfileOutput';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';

/**
 * Handle SetChargingProfile use case
 * OCPP § 3.22 - Set charging profile
 */
@Injectable()
export class HandleSetChargingProfile {
  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepo: IChargePointRepository,
  ) {}

  async execute(input: SetChargingProfileInput): Promise<SetChargingProfileOutput> {
    if (!input.chargingProfile || !input.chargingProfile.chargingSchedule) {
      return SetChargingProfileOutput.rejected();
    }

    const chargePoint = await this.chargePointRepo.find(input.chargePointId);
    if (!chargePoint) {
      return SetChargingProfileOutput.rejected();
    }

    if (input.connectorId < 0) {
      return SetChargingProfileOutput.rejected();
    }

    return SetChargingProfileOutput.accepted();
  }
}
