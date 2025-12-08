import { Test, TestingModule } from '@nestjs/testing';

import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../../infrastructure/tokens';
import { ChargePoint } from '../../../domain/entities/ChargePoint.entity';
import { HandleRemoteStartTransaction } from '../HandleRemoteStartTransaction';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { RemoteStartTransactionInput } from '../../dto/input/RemoteStartTransactionInput';
import { RemoteStartTransactionOutput } from '../../dto/output/RemoteStartTransactionOutput';

describe('HandleRemoteStartTransaction', () => {
  let handler: HandleRemoteStartTransaction;
  let repository: jest.Mocked<IChargePointRepository>;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findAll: jest.fn(),
      findByChargePointId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleRemoteStartTransaction,
        {
          provide: CHARGE_POINT_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    handler = module.get<HandleRemoteStartTransaction>(
      HandleRemoteStartTransaction,
    );
    repository = module.get<jest.Mocked<IChargePointRepository>>(CHARGE_POINT_REPOSITORY_TOKEN);
  });

  describe('execute', () => {
    it('should accept valid remote start transaction', async () => {
      const chargePoint = new ChargePoint();
      chargePoint.id = 'cp-001';
      chargePoint.chargePointId = 'CP-001';
      repository.find.mockResolvedValue(chargePoint);

      const input = new RemoteStartTransactionInput(
        'CP-001',
        'VEHICLE-123',
        1,
      );
      const result = await handler.execute(input);

      expect(result.status).toBe('Accepted');
      expect(repository.find).toHaveBeenCalledWith('CP-001');
    });

    it('should reject if idTag exceeds maxLength (20)', async () => {
      const input = new RemoteStartTransactionInput(
        'CP-001',
        'VEHICLE-123-TOOLONG-EXCEEDS', // > 20 chars
      );
      const result = await handler.execute(input);

      expect(result.status).toBe('Rejected');
    });

    it('should reject if idTag is empty', async () => {
      const input = new RemoteStartTransactionInput('CP-001', '');
      const result = await handler.execute(input);

      expect(result.status).toBe('Rejected');
    });

    it('should reject if charge point not found', async () => {
      repository.find.mockResolvedValue(null);

      const input = new RemoteStartTransactionInput(
        'CP-NOT-FOUND',
        'VEHICLE-123',
      );
      const result = await handler.execute(input);

      expect(result.status).toBe('Rejected');
    });

    it('should reject if connectorId is negative', async () => {
      const chargePoint = new ChargePoint();
      chargePoint.id = 'cp-001';
      repository.find.mockResolvedValue(chargePoint);

      const input = new RemoteStartTransactionInput(
        'CP-001',
        'VEHICLE-123',
        -1,
      );
      const result = await handler.execute(input);

      expect(result.status).toBe('Rejected');
    });

    it('should accept with optional chargingProfile', async () => {
      const chargePoint = new ChargePoint();
      chargePoint.id = 'cp-001';
      repository.find.mockResolvedValue(chargePoint);

      const input = new RemoteStartTransactionInput(
        'CP-001',
        'VEHICLE-123',
        1,
        {
          chargingProfileId: 1,
          stackLevel: 0,
          chargingProfilePurpose: 'TxProfile',
          chargingProfileKind: 'Relative',
          chargingSchedule: {
            chargingRateUnit: 'A',
            chargingSchedulePeriod: [
              { startPeriod: 0, limit: 10 },
            ],
          },
        },
      );
      const result = await handler.execute(input);

      expect(result.status).toBe('Accepted');
    });
  });
});
