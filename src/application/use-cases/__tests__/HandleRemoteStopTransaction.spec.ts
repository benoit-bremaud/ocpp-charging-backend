import { Test, TestingModule } from '@nestjs/testing';

import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../../infrastructure/tokens';
import { HandleRemoteStopTransaction } from '../HandleRemoteStopTransaction';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { RemoteStopTransactionInput } from '../../dto/input/RemoteStopTransactionInput';

describe('HandleRemoteStopTransaction', () => {
  let handler: HandleRemoteStopTransaction;
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
        HandleRemoteStopTransaction,
        {
          provide: CHARGE_POINT_REPOSITORY_TOKEN,
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get<HandleRemoteStopTransaction>(HandleRemoteStopTransaction);
  });

  describe('execute', () => {
    it('should accept valid remote stop transaction', async () => {
      const input: RemoteStopTransactionInput = {
        chargePointId: 'CP-001',
        transactionId: 123,
      };

      repository.find.mockResolvedValue({ id: 'CP-001' } as any);

      const result = await handler.execute(input);

      expect(result.status).toBe('Accepted');
    });

    it('should reject invalid transactionId', async () => {
      const input: RemoteStopTransactionInput = {
        chargePointId: 'CP-001',
        transactionId: 0,
      };

      repository.find.mockResolvedValue({ id: 'CP-001' } as any);

      const result = await handler.execute(input);

      expect(result.status).toBe('Rejected');
    });

    it('should reject if charge point not found', async () => {
      const input: RemoteStopTransactionInput = {
        chargePointId: 'CP-NONEXISTENT',
        transactionId: 123,
      };

      repository.find.mockResolvedValue(null);

      const result = await handler.execute(input);

      expect(result.status).toBe('Rejected');
    });

    it('should reject negative transactionId', async () => {
      const input: RemoteStopTransactionInput = {
        chargePointId: 'CP-001',
        transactionId: -1,
      };

      repository.find.mockResolvedValue({ id: 'CP-001' } as any);

      const result = await handler.execute(input);

      expect(result.status).toBe('Rejected');
    });

    it('should accept with valid charge point and transaction', async () => {
      const input: RemoteStopTransactionInput = {
        chargePointId: 'CP-001',
        transactionId: 999,
      };

      repository.find.mockResolvedValue({ id: 'CP-001' } as any);

      const result = await handler.execute(input);

      expect(result.status).toBe('Accepted');
    });
  });
});
