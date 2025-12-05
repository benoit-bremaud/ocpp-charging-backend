import { Injectable, Inject } from '@nestjs/common';

import { ChargePoint } from '../../domain/entities/ChargePoint.entity';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';

/**
 * Use-Case: Retrieve a ChargePoint by its business identifier.
 *
 * CLEAN: Application layer - orchestrates domain + infrastructure.
 * SOLID: Depends on IChargePointRepository abstraction (DIP).
 *
 * Testable: Easy to mock the repository for unit tests.
 */
@Injectable()
export class SelectChargePoint {
  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepository: IChargePointRepository,
  ) {}

  /**
   * Execute the use-case: find a ChargePoint by its business identifier.
   *
   * @param chargePointId - Business identifier (e.g., "CP-001")
   * @returns ChargePoint entity if found
   * @throws Error if ChargePoint not found
   *
   * Domain rule: Every ChargePoint must exist in the repository.
   */
  async execute(chargePointId: string): Promise<ChargePoint> {
    if (!chargePointId || chargePointId.trim().length === 0) {
      throw new Error('chargePointId must not be empty');
    }

    const chargePoint = await this.chargePointRepository.findByChargePointId(
      chargePointId,
    );

    if (!chargePoint) {
      throw new Error(
        `ChargePoint with chargePointId="${chargePointId}" not found`,
      );
    }

    return chargePoint;
  }
}
