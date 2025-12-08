import { Injectable } from '@nestjs/common';
import { ChargePoint } from '../../domain/entities/ChargePoint.entity';
import { CreateChargePointInput, toChargePointEntityData } from '../dto/CreateChargePointInput';
import { ChargePointOutput } from '../dto/output/ChargePointOutput';

/**
 * Mapper Pattern : Transformer entre couches (DTO ↔ Entity)
 * SOLID: S (Single Responsibility), D (Dependency Inversion)
 */
@Injectable()
export class ChargePointMapper {
  /**
   * Convertir CreateChargePointInput → ChargePoint Entity
   */
  toDomain(input: CreateChargePointInput): ChargePoint {
    const entity = new ChargePoint();
    const data = toChargePointEntityData(input);
    Object.assign(entity, data);
    return entity;
  }

  /**
   * Convertir ChargePoint Entity → ChargePointOutput DTO
   */
  toDTO(entity: ChargePoint): ChargePointOutput {
    const output = new ChargePointOutput();
    output.id = entity.id;
    output.chargePointId = entity.chargePointId;
    output.model = entity.chargePointModel;
    output.vendor = entity.chargePointVendor;
    output.firmwareVersion = entity.firmwareVersion;
    return output;
  }

  /**
   * Convertir ChargePoint[] → ChargePointOutput[]
   */
  toDTOArray(entities: ChargePoint[]): ChargePointOutput[] {
    return entities.map(e => this.toDTO(e));
  }
}
