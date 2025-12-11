import { Test, TestingModule } from '@nestjs/testing';

import { CHARGE_POINT_REPOSITORY_TOKEN } from '@/infrastructure/tokens';
import { ChangeAvailabilityInput } from '@/application/dto/input/ChangeAvailabilityInput';
import { HandleChangeAvailability } from '@/application/use-cases/HandleChangeAvailability';
import { IChargePointRepository } from '@/domain/repositories/IChargePointRepository';

describe('HandleChangeAvailability', () => {
  let handler: HandleChangeAvailability;
  let repository: jest.Mocked<IChargePointRepository>;

  beforeEach(async () => {
    repository = {
      find: jest.fn(),
      findByChargePointId: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleChangeAvailability,
        {
          provide: CHARGE_POINT_REPOSITORY_TOKEN,
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get<HandleChangeAvailability>(HandleChangeAvailability);
  });

  describe('execute', () => {
    it('should accept operative type', async () => {
      const input: ChangeAvailabilityInput = {
        chargePointId: 'CP-001',
        connectorId: 1,
        type: 'Operative',
      };
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const result = await handler.execute(input);
      expect(result.status).toMatch(/Accepted|Scheduled/);
    });

    it('should accept inoperative type', async () => {
      const input: ChangeAvailabilityInput = {
        chargePointId: 'CP-001',
        connectorId: 1,
        type: 'Inoperative',
      };
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const result = await handler.execute(input);
      expect(result.status).toMatch(/Accepted|Scheduled/);
    });

    it('should reject invalid type', async () => {
      const input: any = { chargePointId: 'CP-001', connectorId: 1, type: 'Invalid' };
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const result = await handler.execute(input);
      expect(result.status).toBe('Rejected');
    });

    it('should reject if charge point not found', async () => {
      const input: ChangeAvailabilityInput = {
        chargePointId: 'CP-NONEXISTENT',
        connectorId: 1,
        type: 'Operative',
      };
      repository.find.mockResolvedValue(null);
      const result = await handler.execute(input);
      expect(result.status).toBe('Rejected');
    });

    it('should accept for any connector ID', async () => {
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      for (let i = 0; i <= 3; i++) {
        const result = await handler.execute({
          chargePointId: 'CP-001',
          connectorId: i,
          type: 'Operative',
        });
        expect(result.status).toMatch(/Accepted|Scheduled/);
      }
    });
  });
});
