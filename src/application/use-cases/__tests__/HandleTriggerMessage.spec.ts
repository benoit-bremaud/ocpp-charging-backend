import { Test, TestingModule } from '@nestjs/testing';

import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../../infrastructure/tokens';
import { HandleTriggerMessage } from '../HandleTriggerMessage';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { TriggerMessageInput } from '../../dto/input/TriggerMessageInput';

describe('HandleTriggerMessage', () => {
  let handler: HandleTriggerMessage;
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
        HandleTriggerMessage,
        {
          provide: CHARGE_POINT_REPOSITORY_TOKEN,
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get<HandleTriggerMessage>(HandleTriggerMessage);
  });

  describe('execute', () => {
    it('should accept trigger message', async () => {
      const input: TriggerMessageInput = { chargePointId: 'CP-001', requestedMessage: 'Heartbeat' };
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const result = await handler.execute(input);
      expect(result.status).toBe('Accepted');
    });

    it('should reject empty message type', async () => {
      const input: TriggerMessageInput = { chargePointId: 'CP-001', requestedMessage: '' };
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const result = await handler.execute(input);
      expect(result.status).toBe('Rejected');
    });

    it('should reject if charge point not found', async () => {
      const input: TriggerMessageInput = {
        chargePointId: 'CP-NONEXISTENT',
        requestedMessage: 'Heartbeat',
      };
      repository.find.mockResolvedValue(null);
      const result = await handler.execute(input);
      expect(result.status).toBe('Rejected');
    });

    it('should accept with optional connectorId', async () => {
      const input: TriggerMessageInput = {
        chargePointId: 'CP-001',
        requestedMessage: 'Heartbeat',
        connectorId: 1,
      };
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const result = await handler.execute(input);
      expect(result.status).toBe('Accepted');
    });

    it('should accept various message types', async () => {
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const messages = ['Heartbeat', 'StatusNotification', 'MeterValues'];
      for (const msg of messages) {
        const result = await handler.execute({ chargePointId: 'CP-001', requestedMessage: msg });
        expect(result.status).toBe('Accepted');
      }
    });
  });
});
