import { Inject, Injectable } from '@nestjs/common';

import { ChargePoint } from '../../domain/entities/ChargePoint.entity';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';

/**
 * Use-Case: Retrieve all ChargePoints.
 *
 * CLEAN: Application layer coordinates repository.
 * SOLID: Depends on IChargePointRepository abstraction (DIP).
 */
@Injectable()
export class FindAllChargePoints {
  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepository: IChargePointRepository,
  ) {}

  /**
   * Execute the use-case: list all ChargePoints.
   */
  async execute(): Promise<ChargePoint[]> {
    return this.chargePointRepository.findAll();
  }
}
