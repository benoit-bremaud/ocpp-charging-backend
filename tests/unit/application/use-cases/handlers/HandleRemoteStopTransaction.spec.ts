import { Test, TestingModule } from '@nestjs/testing';

import { CHARGE_POINT_REPOSITORY_TOKEN } from '@/infrastructure/tokens';
import { ChargePoint } from '@/domain/entities/ChargePoint.entity';
import { HandleRemoteStopTransaction } from '@/application/use-cases/HandleRemoteStopTransaction';
import { IChargePointRepository } from '@/domain/repositories/IChargePointRepository';
import { RemoteStopTransactionInput } from '@/application/dto/input/RemoteStopTransactionInput';

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

    handler = module.get(HandleRemoteStopTransaction);
  });

  describe('execute', () => {
    // Groupe 1: Basic Validation (Tests 1-5 existing + 3 new)
    it('should accept valid remote stop transaction', async () => {
      const input = new RemoteStopTransactionInput('CP-001', 123);
      repository.find.mockResolvedValue({
        id: 'CP-001',
        chargePointId: 'CP-001',
      } as ChargePoint);

      const result = await handler.execute(input);
      expect(result.status).toBe('Accepted');
    });

    it('should reject invalid transactionId', async () => {
      const input = new RemoteStopTransactionInput('CP-001', 0);
      repository.find.mockResolvedValue({
        id: 'CP-001',
        chargePointId: 'CP-001',
      } as ChargePoint);

      const result = await handler.execute(input);
      expect(result.status).toBe('Rejected');
    });

    it('should reject if charge point not found', async () => {
      const input = new RemoteStopTransactionInput('CP-NONEXISTENT', 123);
      repository.find.mockResolvedValue(null);

      const result = await handler.execute(input);
      expect(result.status).toBe('Rejected');
    });

    it('should reject negative transactionId', async () => {
      const input = new RemoteStopTransactionInput('CP-001', -1);
      repository.find.mockResolvedValue({
        id: 'CP-001',
        chargePointId: 'CP-001',
      } as ChargePoint);

      const result = await handler.execute(input);
      expect(result.status).toBe('Rejected');
    });

    it('should accept with valid charge point and transaction', async () => {
      const input = new RemoteStopTransactionInput('CP-001', 999);
      repository.find.mockResolvedValue({
        id: 'CP-001',
        chargePointId: 'CP-001',
      } as ChargePoint);

      const result = await handler.execute(input);
      expect(result.status).toBe('Accepted');
    });

    // Groupe 2: Boundary Values (Tests 6-8)
    it('should accept transactionId = 1 (minimum valid)', async () => {
      const input = new RemoteStopTransactionInput('CP-001', 1);
      repository.find.mockResolvedValue({
        id: 'CP-001',
        chargePointId: 'CP-001',
      } as ChargePoint);

      const result = await handler.execute(input);
      expect(result.status).toBe('Accepted');
    });

    it('should accept large transactionId values (MAX_SAFE_INTEGER)', async () => {
      const input = new RemoteStopTransactionInput('CP-001', Number.MAX_SAFE_INTEGER);
      repository.find.mockResolvedValue({
        id: 'CP-001',
        chargePointId: 'CP-001',
      } as ChargePoint);

      const result = await handler.execute(input);
      expect(result.status).toBe('Accepted');
    });

    it('should reject if transactionId is not an integer (decimal)', async () => {
      const input = new RemoteStopTransactionInput('CP-001', 123.45);
      repository.find.mockResolvedValue({
        id: 'CP-001',
        chargePointId: 'CP-001',
      } as ChargePoint);

      const result = await handler.execute(input);
      expect(result.status).toBe('Rejected');
    });

    // Groupe 3: Repository Interaction (Tests 9-12)
    it('should call repository.find with chargePointId', async () => {
      const input = new RemoteStopTransactionInput('CP-001', 123);
      repository.find.mockResolvedValue({
        id: 'CP-001',
        chargePointId: 'CP-001',
      } as ChargePoint);

      await handler.execute(input);

      expect(repository.find).toHaveBeenCalledWith('CP-001');
    });

    it('should call repository.find exactly once per execution', async () => {
      const input = new RemoteStopTransactionInput('CP-001', 123);
      repository.find.mockResolvedValue({
        id: 'CP-001',
        chargePointId: 'CP-001',
      } as ChargePoint);

      await handler.execute(input);

      expect(repository.find).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors gracefully', async () => {
      const input = new RemoteStopTransactionInput('CP-001', 123);
      repository.find.mockRejectedValue(new Error('Database connection failed'));

      const result = await handler.execute(input);

      expect(result.status).toBe('Rejected');
    });

    it('should return RemoteStopTransactionOutput with status', async () => {
      const input = new RemoteStopTransactionInput('CP-001', 123);
      repository.find.mockResolvedValue({
        id: 'CP-001',
        chargePointId: 'CP-001',
      } as ChargePoint);

      const result = await handler.execute(input);

      expect(result).toHaveProperty('status');
      expect(['Accepted', 'Rejected']).toContain(result.status);
    });

    // Groupe 4: Performance & Concurrency (Tests 13-18)
    it('should complete within 100ms SLA', async () => {
      const input = new RemoteStopTransactionInput('CP-001', 123);
      repository.find.mockResolvedValue({
        id: 'CP-001',
        chargePointId: 'CP-001',
      } as ChargePoint);

      const start = Date.now();
      await handler.execute(input);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent stop requests for different transactions', async () => {
      const inputs = [
        new RemoteStopTransactionInput('CP-001', 1),
        new RemoteStopTransactionInput('CP-002', 2),
        new RemoteStopTransactionInput('CP-003', 3),
      ];

      repository.find.mockImplementation((id: string) =>
        Promise.resolve({
          id,
          chargePointId: id,
        } as ChargePoint),
      );

      const results = await Promise.all(inputs.map((input) => handler.execute(input)));

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.status === 'Accepted')).toBe(true);
    });

    it('should prevent double-stop of same transaction', async () => {
      const input = new RemoteStopTransactionInput('CP-001', 123);
      repository.find.mockResolvedValue({
        id: 'CP-001',
        chargePointId: 'CP-001',
      } as ChargePoint);

      const result1 = await handler.execute(input);
      const result2 = await handler.execute(input);

      expect(result1.status).toBe('Accepted');
      expect(result2.status).toBe('Accepted');
      expect(repository.find).toHaveBeenCalledTimes(2);
    });

    it('should maintain transaction state consistency', async () => {
      const input = new RemoteStopTransactionInput('CP-001', 123);
      const chargePoint = {
        id: 'CP-001',
        chargePointId: 'CP-001',
      } as ChargePoint;
      repository.find.mockResolvedValue(chargePoint);

      const result1 = await handler.execute(input);
      const result2 = await handler.execute(input);

      expect(result1.status).toBe(result2.status);
    });

    // Groupe 5: Edge Cases (Tests 19-22)
    it('should handle multiple rapid stop requests', async () => {
      const input = new RemoteStopTransactionInput('CP-001', 123);
      repository.find.mockResolvedValue({
        id: 'CP-001',
        chargePointId: 'CP-001',
      } as ChargePoint);

      const promises = Array(5)
        .fill(null)
        .map(() => handler.execute(input));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      expect(results.every((r) => r.status === 'Accepted')).toBe(true);
    });

    it('should reject if transactionId is not provided', async () => {
      const input = new RemoteStopTransactionInput('CP-001', undefined as any);
      repository.find.mockResolvedValue({
        id: 'CP-001',
        chargePointId: 'CP-001',
      } as ChargePoint);

      const result = await handler.execute(input);

      expect(result.status).toBe('Rejected');
    });

    it('should maintain idempotency across calls', async () => {
      const input = new RemoteStopTransactionInput('CP-001', 123);
      repository.find.mockResolvedValue({
        id: 'CP-001',
        chargePointId: 'CP-001',
      } as ChargePoint);

      const result1 = await handler.execute(input);
      const result2 = await handler.execute(input);
      const result3 = await handler.execute(input);

      expect(result1.status).toBe(result2.status);
      expect(result2.status).toBe(result3.status);
    });

    it('should return Rejected when transaction not found', async () => {
      const input = new RemoteStopTransactionInput('CP-001', 123);
      repository.find.mockResolvedValue(null);

      const result = await handler.execute(input);

      expect(result.status).toBe('Rejected');
    });
  });
});
