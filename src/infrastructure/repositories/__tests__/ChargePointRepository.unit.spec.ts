import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChargePoint } from '../../../domain/entities/ChargePoint.entity';
import { ChargePointRepository } from '../ChargePointRepository';

/**
 * Unit Tests: ChargePointRepository
 * Tests with mocked TypeORM repository
 */
describe('ChargePointRepository (Unit)', () => {
  let repository: ChargePointRepository;
  let typeormRepository: jest.Mocked<Repository<ChargePoint>>;

  beforeEach(async () => {
    const mockTypeormRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChargePointRepository,
        {
          provide: getRepositoryToken(ChargePoint),
          useValue: mockTypeormRepository,
        },
      ],
    }).compile();

    repository = module.get<ChargePointRepository>(ChargePointRepository);
    typeormRepository = module.get(getRepositoryToken(ChargePoint));
  });

  describe('create', () => {
    it('should create and save a charge point', async () => {
      const input: Partial<ChargePoint> = {
        chargePointId: 'CP-001',
        chargePointModel: 'Model X',
        chargePointVendor: 'Vendor Y',
        firmwareVersion: '1.0.0',
      };

      const saved = new ChargePoint();
      saved.id = 'uuid-123';
      saved.chargePointId = 'CP-001';
      saved.status = 'OFFLINE';

      typeormRepository.create.mockReturnValue(saved);
      typeormRepository.save.mockResolvedValue(saved);

      const result = await repository.create(input);

      expect(typeormRepository.create).toHaveBeenCalledWith(input);
      expect(typeormRepository.save).toHaveBeenCalledWith(saved);
      expect(result.chargePointId).toBe('CP-001');
    });
  });

  describe('find', () => {
    it('should find charge point by ID', async () => {
      const found = new ChargePoint();
      found.id = 'uuid-123';
      found.chargePointId = 'CP-001';

      typeormRepository.findOne.mockResolvedValue(found);

      const result = await repository.find('uuid-123');

      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
      expect(result?.chargePointId).toBe('CP-001');
    });

    it('should return null if not found', async () => {
      typeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.find('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all charge points', async () => {
      const cp1 = new ChargePoint();
      cp1.chargePointId = 'CP-001';
      const cp2 = new ChargePoint();
      cp2.chargePointId = 'CP-002';

      typeormRepository.find.mockResolvedValue([cp1, cp2]);

      const result = await repository.findAll();

      expect(typeormRepository.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });

  describe('findByChargePointId', () => {
    it('should find by business identifier', async () => {
      const found = new ChargePoint();
      found.chargePointId = 'CP-BIZ-001';

      typeormRepository.findOne.mockResolvedValue(found);

      const result = await repository.findByChargePointId('CP-BIZ-001');

      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { chargePointId: 'CP-BIZ-001' },
      });
      expect(result?.chargePointId).toBe('CP-BIZ-001');
    });
  });

  describe('update', () => {
    it('should update and return updated charge point', async () => {
      const updated = new ChargePoint();
      updated.id = 'uuid-123';
      updated.chargePointModel = 'Updated Model';

      typeormRepository.findOne.mockResolvedValue(updated);

      const result = await repository.update('uuid-123', {
        chargePointModel: 'Updated Model',
      });

      expect(typeormRepository.update).toHaveBeenCalledWith('uuid-123', {
        chargePointModel: 'Updated Model',
      });
      expect(result.chargePointModel).toBe('Updated Model');
    });

    it('should throw if not found after update', async () => {
      typeormRepository.findOne.mockResolvedValue(null);

      await expect(repository.update('non-existent', {})).rejects.toThrow('not found after update');
    });
  });

  describe('delete', () => {
    it('should delete charge point', async () => {
      await repository.delete('uuid-123');

      expect(typeormRepository.delete).toHaveBeenCalledWith('uuid-123');
    });
  });
});
