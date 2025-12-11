import { Test, TestingModule } from '@nestjs/testing';

import { CHARGE_POINT_REPOSITORY_TOKEN } from '@/infrastructure/tokens';
import { ChangeConfigurationInput } from '@/application/dto/input/ChangeConfigurationInput';
import { HandleChangeConfiguration } from '@/application/use-cases/HandleChangeConfiguration';
import { IChargePointRepository } from '@/domain/repositories/IChargePointRepository';

describe('HandleChangeConfiguration', () => {
  let handler: HandleChangeConfiguration;
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
        HandleChangeConfiguration,
        {
          provide: CHARGE_POINT_REPOSITORY_TOKEN,
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get<HandleChangeConfiguration>(HandleChangeConfiguration);
  });

  describe('execute', () => {
    it('should accept valid configuration change', async () => {
      const input: ChangeConfigurationInput = {
        chargePointId: 'CP-001',
        key: 'HeartbeatInterval',
        value: '60',
      };
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const result = await handler.execute(input);
      expect(result.status).toMatch(/Accepted|RebootRequired/);
    });

    it('should require reboot for AuthorizationKey', async () => {
      const input: ChangeConfigurationInput = {
        chargePointId: 'CP-001',
        key: 'AuthorizationKey',
        value: 'newkey',
      };
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const result = await handler.execute(input);
      expect(result.status).toBe('RebootRequired');
    });

    it('should require reboot for SecurityProfile', async () => {
      const input: ChangeConfigurationInput = {
        chargePointId: 'CP-001',
        key: 'SecurityProfile',
        value: '1',
      };
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const result = await handler.execute(input);
      expect(result.status).toBe('RebootRequired');
    });

    it('should reject empty key', async () => {
      const input: ChangeConfigurationInput = { chargePointId: 'CP-001', key: '', value: 'value' };
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const result = await handler.execute(input);
      expect(result.status).toBe('Rejected');
    });

    it('should reject if charge point not found', async () => {
      const input: ChangeConfigurationInput = {
        chargePointId: 'CP-NONEXISTENT',
        key: 'HeartbeatInterval',
        value: '60',
      };
      repository.find.mockResolvedValue(null);
      const result = await handler.execute(input);
      expect(result.status).toBe('Rejected');
    });
  });
});
