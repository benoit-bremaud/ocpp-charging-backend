import { ChargePoint } from '../entities/ChargePoint.entity';

/**
 * Domain Layer: Repository Interface (abstraction).
 *
 * CLEAN: No implementation details, pure contract.
 * SOLID: Abstraction for Dependency Inversion.
 */
export interface IChargePointRepository {
  /**
   * Find a ChargePoint by UUID.
   */
  find(id: string): Promise<ChargePoint | null>;

  /**
   * Find all ChargePoints.
   */
  findAll(): Promise<ChargePoint[]>;

  /**
   * Find a ChargePoint by business identifier (chargePointId).
   */
  findByChargePointId(chargePointId: string): Promise<ChargePoint | null>;

  /**
   * Create a new ChargePoint.
   */
  create(data: Partial<ChargePoint>): Promise<ChargePoint>;

  /**
   * Update an existing ChargePoint by UUID.
   */
  update(id: string, data: Partial<ChargePoint>): Promise<ChargePoint>;

  /**
   * Delete a ChargePoint by UUID.
   */
  delete(id: string): Promise<void>;
}
