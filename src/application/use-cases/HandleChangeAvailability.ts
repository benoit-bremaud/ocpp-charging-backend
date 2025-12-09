import { Injectable, Inject } from '@nestjs/common';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';
import { ChangeAvailabilityInput } from '../dto/input/ChangeAvailabilityInput';
import { ChangeAvailabilityOutput } from '../dto/output/ChangeAvailabilityOutput';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';

/**
 * Handle ChangeAvailability use case
 * OCPP § 3.21 - Change charge point/connector availability
 */
@Injectable()
export class HandleChangeAvailability {
  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepo: IChargePointRepository,
  ) {}

  async execute(input: ChangeAvailabilityInput): Promise<ChangeAvailabilityOutput> {
    if (!['Operative', 'Inoperative'].includes(input.type)) {
      return ChangeAvailabilityOutput.rejected();
    }

    const chargePoint = await this.chargePointRepo.find(input.chargePointId);
    if (!chargePoint) {
      return ChangeAvailabilityOutput.rejected();
    }

    return ChangeAvailabilityOutput.accepted();
  }
}
