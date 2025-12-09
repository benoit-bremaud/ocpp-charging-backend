import { Injectable, Inject } from '@nestjs/common';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';
import { ResetInput } from '../dto/input/ResetInput';
import { ResetOutput } from '../dto/output/ResetOutput';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';

/**
 * Handle Reset use case
 * OCPP § 3.17 - Reset charge point
 */
@Injectable()
export class HandleReset {
  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepo: IChargePointRepository,
  ) {}

  async execute(input: ResetInput): Promise<ResetOutput> {
    if (!['Hard', 'Soft'].includes(input.type)) {
      return ResetOutput.rejected();
    }

    const chargePoint = await this.chargePointRepo.find(input.chargePointId);
    if (!chargePoint) {
      return ResetOutput.rejected();
    }

    return ResetOutput.accepted();
  }
}
