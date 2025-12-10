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


    handler = module.get<HandleRemoteStartTransaction>(HandleRemoteStartTransaction);
    repository = module.get<jest.Mocked<IChargePointRepository>>(CHARGE_POINT_REPOSITORY_TOKEN);
  });


  describe('execute', () => {
    // ✅ EXISTING 6 TESTS - Happy Path & Basic Validation

    it('should accept valid remote start transaction', async () => {
      const chargePoint = new ChargePoint();
      chargePoint.id = 'cp-001';
      chargePoint.chargePointId = 'CP-001';
      repository.find.mockResolvedValue(chargePoint);


      const input = new RemoteStartTransactionInput('CP-001', 'VEHICLE-123', 1);
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


      const input = new RemoteStartTransactionInput('CP-NOT-FOUND', 'VEHICLE-123');


      const result = await handler.execute(input);


      expect(result.status).toBe('Rejected');
    });


    it('should reject if connectorId is negative', async () => {
      const chargePoint = new ChargePoint();
      chargePoint.id = 'cp-001';
      repository.find.mockResolvedValue(chargePoint);


      const input = new RemoteStartTransactionInput('CP-001', 'VEHICLE-123', -1);


      const result = await handler.execute(input);


      expect(result.status).toBe('Rejected');
    });


    it('should accept with optional chargingProfile', async () => {
      const chargePoint = new ChargePoint();
      chargePoint.id = 'cp-001';
      repository.find.mockResolvedValue(chargePoint);


      const input = new RemoteStartTransactionInput('CP-001', 'VEHICLE-123', 1, {
        chargingProfileId: 1,
        stackLevel: 0,
        chargingProfilePurpose: 'TxProfile',
        chargingProfileKind: 'Relative',
      });


      const result = await handler.execute(input);


      expect(result.status).toBe('Accepted');
    });

    // ✅ NEW 14 TESTS FOR COMPREHENSIVE COVERAGE

    // Happy Path - Format & Response Structure
    it('should return RemoteStartTransactionOutput with status', async () => {
      const chargePoint = new ChargePoint();
      chargePoint.id = 'cp-001';
      chargePoint.chargePointId = 'CP-001';
      repository.find.mockResolvedValue(chargePoint);

      const input = new RemoteStartTransactionInput('CP-001', 'USER-001', 1);
      const result = await handler.execute(input);

      expect(result).toBeInstanceOf(RemoteStartTransactionOutput);
      expect(result).toHaveProperty('status');
    });

    it('should accept idTag with exactly 1 character', async () => {
      const chargePoint = new ChargePoint();
      chargePoint.id = 'cp-001';
      repository.find.mockResolvedValue(chargePoint);

      const input = new RemoteStartTransactionInput('CP-001', 'A', 1);
      const result = await handler.execute(input);

      expect(result.status).toBe('Accepted');
    });

    it('should accept idTag with exactly 20 characters', async () => {
      const chargePoint = new ChargePoint();
      chargePoint.id = 'cp-001';
      repository.find.mockResolvedValue(chargePoint);

      const input = new RemoteStartTransactionInput('CP-001', 'A'.repeat(20), 1);
      const result = await handler.execute(input);

      expect(result.status).toBe('Accepted');
    });

    it('should return Rejected for 21-character idTag', async () => {
      const chargePoint = new ChargePoint();
      chargePoint.id = 'cp-001';
      repository.find.mockResolvedValue(chargePoint);

      const input = new RemoteStartTransactionInput('CP-001', 'A'.repeat(21), 1);
      const result = await handler.execute(input);

      expect(result.status).toBe('Rejected');
    });

    // Validation - ConnectorId Edge Cases
    it('should accept connectorId = 0', async () => {
      const chargePoint = new ChargePoint();
      chargePoint.id = 'cp-001';
      repository.find.mockResolvedValue(chargePoint);

      const input = new RemoteStartTransactionInput('CP-001', 'USER-002', 0);
      const result = await handler.execute(input);

      expect(result.status).toBe('Accepted');
    });

    it('should reject connectorId = -2', async () => {
      const chargePoint = new ChargePoint();
      chargePoint.id = 'cp-001';
      repository.find.mockResolvedValue(chargePoint);

      const input = new RemoteStartTransactionInput('CP-001', 'USER-003', -2);
      const result = await handler.execute(input);

      expect(result.status).toBe('Rejected');
    });

    it('should accept large connectorId values', async () => {
      const chargePoint = new ChargePoint();
      chargePoint.id = 'cp-001';
      repository.find.mockResolvedValue(chargePoint);

      const input = new RemoteStartTransactionInput('CP-001', 'USER-004', 9999);
      const result = await handler.execute(input);

      expect(result.status).toBe('Accepted');
    });

    it('should reject if connectorId is not a valid integer', async () => {
      const chargePoint = new ChargePoint();
      chargePoint.id = 'cp-001';
      repository.find.mockResolvedValue(chargePoint);

      const input = new RemoteStartTransactionInput('CP-001', 'USER-005', 1.5 as any);
      const result = await handler.execute(input);

      // Handler should validate integer type
      expect(result.status).toBe('Rejected');
    });

    // Repository Interaction
    it('should call repository.find with chargePointId', async () => {
      const chargePoint = new ChargePoint();
      chargePoint.id = 'cp-002';
      chargePoint.chargePointId = 'CP-002';
      repository.find.mockResolvedValue(chargePoint);

      const input = new RemoteStartTransactionInput('CP-002', 'USER-006', 2);
      await handler.execute(input);

      expect(repository.find).toHaveBeenCalledWith('CP-002');
    });

    it('should call repository.find exactly once per execution', async () => {
      const chargePoint = new ChargePoint();
      chargePoint.id = 'cp-001';
      chargePoint.chargePointId = 'CP-001';
      repository.find.mockResolvedValue(chargePoint);

      const input = new RemoteStartTransactionInput('CP-001', 'USER-007', 1);
      await handler.execute(input);

      expect(repository.find).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors gracefully', async () => {
      repository.find.mockRejectedValue(new Error('Database connection failed'));

      const input = new RemoteStartTransactionInput('CP-001', 'USER-008', 1);
      const result = await handler.execute(input);

      expect(result.status).toBe('Rejected');
    });

    // Performance & Concurrency
    it('should complete within 100ms SLA', async () => {
      const chargePoint = new ChargePoint();
      chargePoint.id = 'cp-001';
      chargePoint.chargePointId = 'CP-001';
      repository.find.mockResolvedValue(chargePoint);

      const input = new RemoteStartTransactionInput('CP-001', 'PERF-USER', 1);
      const startTime = performance.now();
      const result = await handler.execute(input);
      const duration = performance.now() - startTime;

      expect(result.status).toBe('Accepted');
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent requests for different charge points', async () => {
      const chargePoint1 = new ChargePoint();
      chargePoint1.id = 'cp-001';
      chargePoint1.chargePointId = 'CP-001';

      const chargePoint2 = new ChargePoint();
      chargePoint2.id = 'cp-002';
      chargePoint2.chargePointId = 'CP-002';

      repository.find
        .mockResolvedValueOnce(chargePoint1)
        .mockResolvedValueOnce(chargePoint2);

      const input1 = new RemoteStartTransactionInput('CP-001', 'USER-009', 1);
      const input2 = new RemoteStartTransactionInput('CP-002', 'USER-010', 2);

      const results = await Promise.all([
        handler.execute(input1),
        handler.execute(input2),
      ]);

      expect(results).toHaveLength(2);
      results.forEach((result) => {
        expect(result.status).toBe('Accepted');
      });
    });

    it('should maintain status consistency across multiple calls', async () => {
      const chargePoint = new ChargePoint();
      chargePoint.id = 'cp-001';
      chargePoint.chargePointId = 'CP-001';
      repository.find.mockResolvedValue(chargePoint);

      const input = new RemoteStartTransactionInput('CP-001', 'CONSISTENT-USER', 1);
      const result1 = await handler.execute(input);
      const result2 = await handler.execute(input);

      expect(result1.status).toBe(result2.status);
      expect(result1.status).toBe('Accepted');
    });
  });
});
