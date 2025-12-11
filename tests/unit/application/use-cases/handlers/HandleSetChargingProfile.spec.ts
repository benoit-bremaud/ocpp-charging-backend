import { Test, TestingModule } from '@nestjs/testing';

import { CHARGE_POINT_REPOSITORY_TOKEN } from '@/infrastructure/tokens';
import { HandleSetChargingProfile } from '@/application/use-cases/HandleSetChargingProfile';
import { IChargePointRepository } from '@/domain/repositories/IChargePointRepository';
import { SetChargingProfileInput } from '@/application/dto/input/SetChargingProfileInput';

describe('HandleSetChargingProfile', () => {
  let handler: HandleSetChargingProfile;
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
        HandleSetChargingProfile,
        {
          provide: CHARGE_POINT_REPOSITORY_TOKEN,
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get<HandleSetChargingProfile>(HandleSetChargingProfile);
  });

  describe('execute', () => {
    it('should accept valid charging profile', async () => {
      const input: SetChargingProfileInput = {
        chargePointId: 'CP-001',
        connectorId: 1,
        chargingProfile: {
          chargingProfileId: 1,
          stackLevel: 0,
          chargingProfilePurpose: 'TxProfile',
          chargingProfileKind: 'Absolute',
          chargingSchedule: { chargingRateUnit: 'A', chargingSchedulePeriod: [] },
        },
      };
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const result = await handler.execute(input);
      expect(result.status).toMatch(/Accepted|NotSupported/);
    });

    it('should reject if charging profile missing', async () => {
      const input: any = { chargePointId: 'CP-001', connectorId: 1, chargingProfile: null };
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const result = await handler.execute(input);
      expect(result.status).toBe('Rejected');
    });

    it('should reject if charging schedule missing', async () => {
      const input: any = {
        chargePointId: 'CP-001',
        connectorId: 1,
        chargingProfile: { chargingProfileId: 1, stackLevel: 0, chargingSchedule: null },
      };
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const result = await handler.execute(input);
      expect(result.status).toBe('Rejected');
    });

    it('should reject if charge point not found', async () => {
      const input: SetChargingProfileInput = {
        chargePointId: 'CP-NONEXISTENT',
        connectorId: 1,
        chargingProfile: {
          chargingProfileId: 1,
          stackLevel: 0,
          chargingProfilePurpose: 'TxProfile',
          chargingProfileKind: 'Absolute',
          chargingSchedule: { chargingRateUnit: 'A', chargingSchedulePeriod: [] },
        },
      };
      repository.find.mockResolvedValue(null);
      const result = await handler.execute(input);
      expect(result.status).toBe('Rejected');
    });

    it('should reject negative connector ID', async () => {
      const input: SetChargingProfileInput = {
        chargePointId: 'CP-001',
        connectorId: -1,
        chargingProfile: {
          chargingProfileId: 1,
          stackLevel: 0,
          chargingProfilePurpose: 'TxProfile',
          chargingProfileKind: 'Absolute',
          chargingSchedule: { chargingRateUnit: 'A', chargingSchedulePeriod: [] },
        },
      };
      repository.find.mockResolvedValue({ id: 'CP-001' } as any);
      const result = await handler.execute(input);
      expect(result.status).toBe('Rejected');
    });
  });
});
