import { ChargePointMapper } from '../ChargePointMapper';
import { ChargePoint } from '../../../domain/entities/ChargePoint.entity';
import type { CreateChargePointInput } from '../../dto/CreateChargePointInput';

describe('ChargePointMapper', () => {
  let mapper: ChargePointMapper;

  beforeEach(() => {
    mapper = new ChargePointMapper();
  });

  describe('toDomain', () => {
    it('should convert CreateChargePointInput to ChargePoint entity', () => {
      const input: CreateChargePointInput = {
        chargePointId: 'CP-001',
        chargePointModel: 'Model X',
        chargePointVendor: 'Vendor Y',
        firmwareVersion: '1.0.0',
      };

      const entity = mapper.toDomain(input);

      expect(entity.chargePointId).toBe('CP-001');
      expect(entity.chargePointModel).toBe('Model X');
      expect(entity.chargePointVendor).toBe('Vendor Y');
      expect(entity.firmwareVersion).toBe('1.0.0');
    });
  });

  describe('toDTO', () => {
    it('should convert ChargePoint entity to ChargePointOutput DTO', () => {
      const entity = new ChargePoint();
      entity.id = '123';
      entity.chargePointId = 'CP-001';
      entity.chargePointModel = 'Model X';
      entity.chargePointVendor = 'Vendor Y';
      entity.firmwareVersion = '1.0.0';

      const dto = mapper.toDTO(entity);

      expect(dto.id).toBe('123');
      expect(dto.chargePointId).toBe('CP-001');
      expect(dto.model).toBe('Model X');
      expect(dto.vendor).toBe('Vendor Y');
      expect(dto.firmwareVersion).toBe('1.0.0');
    });
  });

  describe('toDTOArray', () => {
    it('should convert array of entities to array of DTOs', () => {
      const entity1 = new ChargePoint();
      entity1.id = '1';
      entity1.chargePointId = 'CP-001';

      const entity2 = new ChargePoint();
      entity2.id = '2';
      entity2.chargePointId = 'CP-002';

      const entities = [entity1, entity2];
      const dtos = mapper.toDTOArray(entities);

      expect(dtos).toHaveLength(2);
      expect(dtos[0].chargePointId).toBe('CP-001');
      expect(dtos[1].chargePointId).toBe('CP-002');
    });
  });
});
