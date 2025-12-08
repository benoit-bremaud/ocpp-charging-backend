import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChargePoint } from '../../../domain/entities/ChargePoint.entity';
import { ChargePointRepository } from '../ChargePointRepository';

/**
 * Integration Tests: ChargePointRepository
 * Tests real database operations (PostgreSQL)
 */
describe('ChargePointRepository (Integration)', () => {
  let module: TestingModule;
  let repository: ChargePointRepository;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DATABASE_HOST || 'localhost',
          port: parseInt(process.env.DATABASE_PORT || '5432'),
          username: process.env.DATABASE_USER || 'postgres',
          password: process.env.DATABASE_PASSWORD || 'postgres',
          database: process.env.DATABASE_NAME || 'ocpp_test',
          entities: [ChargePoint],
          synchronize: true,
          dropSchema: true
        }),
        TypeOrmModule.forFeature([ChargePoint])
      ],
      providers: [ChargePointRepository]
    }).compile();

    repository = module.get<ChargePointRepository>(ChargePointRepository);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('create', () => {
    it('should create a new charge point in database', async () => {
      const data: Partial<ChargePoint> = {
        chargePointId: 'CP-INT-001',
        chargePointModel: 'Integration Test Model',
        chargePointVendor: 'Test Vendor',
        firmwareVersion: '1.0.0'
      };

      const saved = await repository.create(data);

      expect(saved.id).toBeDefined();
      expect(saved.chargePointId).toBe('CP-INT-001');
      expect(saved.status).toBe('OFFLINE');
    });
  });

  describe('find', () => {
    it('should retrieve charge point by ID', async () => {
      const data: Partial<ChargePoint> = {
        chargePointId: 'CP-FIND-001',
        chargePointModel: 'Find Model',
        chargePointVendor: 'Find Vendor',
        firmwareVersion: '1.0.0'
      };

      const created = await repository.create(data);
      const found = await repository.find(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.chargePointId).toBe('CP-FIND-001');
    });

    it('should return null for non-existent ID', async () => {
      const found = await repository.find('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should retrieve all charge points', async () => {
      const all = await repository.findAll();
      expect(Array.isArray(all)).toBe(true);
    });
  });

  describe('findByChargePointId', () => {
    it('should find charge point by chargePointId', async () => {
      const data: Partial<ChargePoint> = {
        chargePointId: 'CP-BIZ-001',
        chargePointModel: 'Model',
        chargePointVendor: 'Vendor',
        firmwareVersion: '1.0.0'
      };

      await repository.create(data);
      const found = await repository.findByChargePointId('CP-BIZ-001');

      expect(found).toBeDefined();
      expect(found?.chargePointId).toBe('CP-BIZ-001');
    });
  });

  describe('update', () => {
    it('should update charge point', async () => {
      const data: Partial<ChargePoint> = {
        chargePointId: 'CP-UPD-001',
        chargePointModel: 'Original',
        chargePointVendor: 'Vendor',
        firmwareVersion: '1.0.0'
      };

      const created = await repository.create(data);
      const updated = await repository.update(created.id, { chargePointModel: 'Updated' });

      expect(updated.chargePointModel).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete charge point', async () => {
      const data: Partial<ChargePoint> = {
        chargePointId: 'CP-DEL-001',
        chargePointModel: 'Model',
        chargePointVendor: 'Vendor',
        firmwareVersion: '1.0.0'
      };

      const created = await repository.create(data);
      await repository.delete(created.id);

      const found = await repository.find(created.id);
      expect(found).toBeNull();
    });
  });
});
