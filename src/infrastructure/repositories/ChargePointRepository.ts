import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChargePoint } from '../../domain/entities/ChargePoint.entity';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';

/**
 * TypeORM-based implementation of IChargePointRepository.
 *
 * CLEAN: Adapter in Infrastructure layer.
 * SOLID: Implements domain interface, hides persistence details.
 *        Depends on abstraction (IChargePointRepository), not concrete types.
 */
@Injectable()
export class ChargePointRepository implements IChargePointRepository {
  constructor(
    @InjectRepository(ChargePoint)
    private readonly repo: Repository<ChargePoint>,
  ) {}

  /**
   * @inheritdoc
   */
  async findById(id: string): Promise<ChargePoint | null> {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * @inheritdoc
   */
  async findByChargePointId(chargePointId: string): Promise<ChargePoint | null> {
    return this.repo.findOne({ where: { chargePointId } });
  }

  /**
   * @inheritdoc
   */
  async findAll(): Promise<ChargePoint[]> {
    return this.repo.find();
  }

  /**
   * @inheritdoc
   */
  async create(data: Partial<ChargePoint>): Promise<ChargePoint> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  /**
   * @inheritdoc
   */
  async update(id: string, data: Partial<ChargePoint>): Promise<ChargePoint> {
    await this.repo.update(id, data);
    const updated = await this.findById(id);
    
    if (!updated) {
      throw new Error(`ChargePoint with id ${id} not found after update`);
    }
    
    return updated;
  }
}
