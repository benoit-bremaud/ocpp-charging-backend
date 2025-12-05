import { Inject, Injectable } from '@nestjs/common';

import { ChargePoint } from '../../domain/entities/ChargePoint.entity';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';
import {
  CreateChargePointInput,
  toChargePointEntityData,
} from '../dto/CreateChargePointInput';

/**
 * Use-Case: Create a new ChargePoint.
 *
 * CLEAN: Application layer orchestrates validation + repository.
 * SOLID: Depends on IChargePointRepository abstraction (DIP).
 */
@Injectable()
export class CreateChargePoint {
  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepository: IChargePointRepository,
  ) {}

  /**
   * Execute the use-case: create a new ChargePoint.
   *
   * @throws Error if required fields are missing or invalid.
   */
  async execute(input: CreateChargePointInput): Promise<ChargePoint> {
    this.validate(input);

    const entityData = toChargePointEntityData(input);

    const created = await this.chargePointRepository.create(entityData);

    return created;
  }

  private validate(input: CreateChargePointInput): void {
    const requiredFields: (keyof CreateChargePointInput)[] = [
      'chargePointId',
      'chargePointModel',
      'chargePointVendor',
      'firmwareVersion',
    ];

    for (const field of requiredFields) {
      const value = input[field];

      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        throw new Error(`Field "${String(field)}" must not be empty`);
      }
    }
  }
}
