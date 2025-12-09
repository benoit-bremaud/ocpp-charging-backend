import { Test, TestingModule } from '@nestjs/testing';

import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../../infrastructure/tokens';
import { HandleReset } from '../HandleReset';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { ResetInput } from '../../dto/input/ResetInput';

describe('HandleReset', () => {
  let handler: HandleReset;
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
        HandleReset,
        {
          provide: CHARGE_POINT_REPOSITORY_TOKEN,
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get<HandleReset>(HandleReset);
  });

  describe('execute', () => {
    it('should accept hard reset', async () => {
      const input: ResetInput = { chargePointId: 'CP-001', type: 'Hard' };
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const result = await handler.execute(input);
      expect(result.status).toBe('Accepted');
    });

    it('should accept soft reset', async () => {
      const input: ResetInput = { chargePointId: 'CP-001', type: 'Soft' };
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const result = await handler.execute(input);
      expect(result.status).toBe('Accepted');
    });

    it('should reject invalid reset type', async () => {
      const input: any = { chargePointId: 'CP-001', type: 'Invalid' };
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const result = await handler.execute(input);
      expect(result.status).toBe('Rejected');
    });

    it('should reject if charge point not found', async () => {
      const input: ResetInput = { chargePointId: 'CP-NONEXISTENT', type: 'Hard' };
      repository.find.mockResolvedValue(null);
      const result = await handler.execute(input);
      expect(result.status).toBe('Rejected');
    });

    it('should accept both Hard and Soft reset types', async () => {
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const hard = await handler.execute({ chargePointId: 'CP-001', type: 'Hard' });
      const soft = await handler.execute({ chargePointId: 'CP-001', type: 'Soft' });
      expect(hard.status).toBe('Accepted');
      expect(soft.status).toBe('Accepted');
    });
  });
});
