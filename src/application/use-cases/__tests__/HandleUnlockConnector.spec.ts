import { Test, TestingModule } from '@nestjs/testing';

import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../../infrastructure/tokens';
import { HandleUnlockConnector } from '../HandleUnlockConnector';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { UnlockConnectorInput } from '../../dto/input/UnlockConnectorInput';

describe('HandleUnlockConnector', () => {
  let handler: HandleUnlockConnector;
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
        HandleUnlockConnector,
        {
          provide: CHARGE_POINT_REPOSITORY_TOKEN,
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get<HandleUnlockConnector>(HandleUnlockConnector);
  });

  describe('execute', () => {
    it('should accept valid connector unlock', async () => {
      const input: UnlockConnectorInput = { chargePointId: 'CP-001', connectorId: 1 };
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const result = await handler.execute(input);
      expect(result.status).toBe('Accepted');
    });

    it('should reject negative connector ID', async () => {
      const input: UnlockConnectorInput = { chargePointId: 'CP-001', connectorId: -1 };
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const result = await handler.execute(input);
      expect(result.status).toBe('Rejected');
    });

    it('should reject if charge point not found', async () => {
      const input: UnlockConnectorInput = { chargePointId: 'CP-NONEXISTENT', connectorId: 1 };
      repository.find.mockResolvedValue(null);
      const result = await handler.execute(input);
      expect(result.status).toBe('Rejected');
    });

    it('should accept connector 0, 1, 2, etc', async () => {
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      for (let i = 0; i <= 3; i++) {
        const result = await handler.execute({ chargePointId: 'CP-001', connectorId: i });
        expect(result.status).toBe('Accepted');
      }
    })
  });
});
