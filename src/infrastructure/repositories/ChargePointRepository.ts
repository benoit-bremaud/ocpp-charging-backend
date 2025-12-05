import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChargePoint } from '../../domain/entities/ChargePoint.entity';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';

/**
 * Infrastructure Layer: TypeORM implementation of IChargePointRepository.
 *
 * CLEAN: Adapter between domain interface and database.
 * SOLID: Implements IChargePointRepository contract exactly.
 */
@Injectable()
export class ChargePointRepository implements IChargePointRepository {
  constructor(
    @InjectRepository(ChargePoint)
    private readonly typeormRepository: Repository<ChargePoint>,
  ) {}

  /**
   * Find a ChargePoint by UUID.
   */
  async find(id: string): Promise<ChargePoint | null> {
    return this.typeormRepository.findOne({ where: { id } });
  }

  /**
   * Find all ChargePoints.
   */
  async findAll(): Promise<ChargePoint[]> {
    return this.typeormRepository.find();
  }

  /**
   * Find a ChargePoint by business identifier (chargePointId).
   */
  async findByChargePointId(chargePointId: string): Promise<ChargePoint | null> {
    return this.typeormRepository.findOne({ where: { chargePointId } });
  }

  /**
   * Create a new ChargePoint.
   */
  async create(data: Partial<ChargePoint>): Promise<ChargePoint> {
    const entity = this.typeormRepository.create(data);
    return this.typeormRepository.save(entity);
  }

  /**
   * Update an existing ChargePoint by UUID.
   */
  async update(id: string, data: Partial<ChargePoint>): Promise<ChargePoint> {
    await this.typeormRepository.update(id, data);
    const updated = await this.typeormRepository.findOne({ where: { id } });

    if (!updated) {
      throw new Error(`ChargePoint with id="${id}" not found after update`);
    }

    return updated;
  }

  /**
   * Delete a ChargePoint by UUID.
   */
  async delete(id: string): Promise<void> {
    await this.typeormRepository.delete(id);
  }
}
