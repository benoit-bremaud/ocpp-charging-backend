import { Inject, Injectable } from '@nestjs/common';

import { ChargePoint } from '../../domain/entities/ChargePoint.entity';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';
import {
  UpdateChargePointInput,
  toChargePointEntityDataForUpdate,
} from '../dto/UpdateChargePointInput';

/**
 * Use-Case: Update an existing ChargePoint.
 *
 * CLEAN: Application layer orchestrates validation + repository.
 * SOLID: Depends on IChargePointRepository abstraction (DIP).
 */
@Injectable()
export class UpdateChargePoint {
  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepository: IChargePointRepository,
  ) {}

  /**
   * Execute the use-case: update a ChargePoint by its business ID.
   *
   * @throws Error if chargePointId not found.
   */
  async execute(
    chargePointId: string,
    input: UpdateChargePointInput,
  ): Promise<ChargePoint> {
    if (!chargePointId || chargePointId.trim().length === 0) {
      throw new Error('chargePointId must not be empty');
    }

    const existing = await this.chargePointRepository.findByChargePointId(
      chargePointId,
    );

    if (!existing) {
      throw new Error(
        `ChargePoint with chargePointId="${chargePointId}" not found`,
      );
    }

    const updateData = toChargePointEntityDataForUpdate(input);

    const updated = await this.chargePointRepository.update(
      existing.id,
      updateData,
    );

    return updated;
  }
}
