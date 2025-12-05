// src/domain/repositories/IChargePointRepository.ts

import { ChargePoint } from '../entities/ChargePoint.entity';

/**
 * Repository abstraction for ChargePoint aggregate.
 *
 * CLEAN: Port (interface) exposé par le Domain.
 * SOLID: DIP - les couches externes dépendent de cette abstraction.
 */
export interface IChargePointRepository {
  /**
   * Retrieve a ChargePoint by its technical identifier.
   */
  findById(id: string): Promise<ChargePoint | null>;

  /**
   * Retrieve a ChargePoint by its business identifier (chargePointId).
   */
  findByChargePointId(chargePointId: string): Promise<ChargePoint | null>;

  /**
   * List all registered ChargePoints.
   */
  findAll(): Promise<ChargePoint[]>;

  /**
   * Persist a new ChargePoint aggregate.
   */
  create(data: Partial<ChargePoint>): Promise<ChargePoint>;

  /**
   * Update an existing ChargePoint aggregate.
   */
  update(id: string, data: Partial<ChargePoint>): Promise<ChargePoint>;
}
