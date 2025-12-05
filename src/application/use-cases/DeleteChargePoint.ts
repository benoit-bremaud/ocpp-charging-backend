import { Inject, Injectable } from '@nestjs/common';

import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';

/**
 * Use-Case: Delete a ChargePoint.
 *
 * CLEAN: Application layer orchestrates repository.
 * SOLID: Depends on IChargePointRepository abstraction (DIP).
 */
@Injectable()
export class DeleteChargePoint {
  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepository: IChargePointRepository,
  ) {}

  /**
   * Execute the use-case: delete a ChargePoint by its UUID.
   *
   * @throws Error if id not found.
   */
  async execute(id: string): Promise<void> {
    if (!id || id.trim().length === 0) {
      throw new Error('id must not be empty');
    }

    const existing = await this.chargePointRepository.find(id);

    if (!existing) {
      throw new Error(`ChargePoint with id="${id}" not found`);
    }

    await this.chargePointRepository.delete(id);
  }
}
