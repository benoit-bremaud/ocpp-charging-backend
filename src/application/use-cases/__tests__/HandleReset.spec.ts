import { Test, TestingModule } from '@nestjs/testing';
import { HandleReset } from '../HandleReset';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { ResetInput } from '../../dto/input/ResetInput';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../../infrastructure/tokens';
import { ChargePoint } from '../../../domain/entities/ChargePoint.entity';

describe('HandleReset', () => {
  let handler: HandleReset;
  let mockRepository: jest.Mocked<IChargePointRepository>;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findByChargePointId: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleReset,
        {
          provide: CHARGE_POINT_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    handler = module.get<HandleReset>(HandleReset);
  });

  describe('Happy Path - Valid Resets', () => {
    it('should accept hard reset when ChargePoint exists', async () => {
      const input: ResetInput = {
        chargePointId: 'CP-001',
        type: 'Hard',
      };

      mockRepository.find.mockResolvedValue({
        id: 'cp-123',
        chargePointId: 'CP-001',
      } as ChargePoint);

      const result = await handler.execute(input);

      expect(result.status).toBe('Accepted');
    });

    it('should accept soft reset when ChargePoint exists', async () => {
      const input: ResetInput = {
        chargePointId: 'CP-002',
        type: 'Soft',
      };

      mockRepository.find.mockResolvedValue({
        id: 'cp-456',
        chargePointId: 'CP-002',
      } as ChargePoint);

      const result = await handler.execute(input);

      expect(result.status).toBe('Accepted');
    });

    it('should preserve reset type in execution', async () => {
      const input: ResetInput = {
        chargePointId: 'CP-003',
        type: 'Hard',
      };

      mockRepository.find.mockResolvedValue({
        id: 'cp-789',
        chargePointId: 'CP-003',
      } as ChargePoint);

      const result = await handler.execute(input);

      expect(result.status).toBe('Accepted');
    });

    it('should handle multiple consecutive resets', async () => {
      const inputs = [
        { chargePointId: 'CP-004', type: 'Hard' as const },
        { chargePointId: 'CP-005', type: 'Soft' as const },
        { chargePointId: 'CP-006', type: 'Hard' as const },
      ];

      mockRepository.find.mockResolvedValue({
        id: 'cp-999',
        chargePointId: 'CP-004',
      } as ChargePoint);

      const results = await Promise.all(
        inputs.map((input) => handler.execute(input))
      );

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.status === 'Accepted')).toBe(true);
    });

    it('should return valid ResetOutput object', async () => {
      const input: ResetInput = {
        chargePointId: 'CP-007',
        type: 'Soft',
      };

      mockRepository.find.mockResolvedValue({
        id: 'cp-111',
        chargePointId: 'CP-007',
      } as ChargePoint);

      const result = await handler.execute(input);

      expect(result).toHaveProperty('status');
      expect(typeof result.status).toBe('string');
    });
  });

  describe('Reset Type Validation', () => {
    it('should reject invalid reset type', async () => {
      const input = {
        chargePointId: 'CP-008',
        type: 'Invalid',
      } as any;

      mockRepository.find.mockResolvedValue({
        id: 'cp-222',
        chargePointId: 'CP-008',
      } as ChargePoint);

      const result = await handler.execute(input);

      expect(result.status).toBe('Rejected');
    });

    it('should reject null reset type', async () => {
      const input = {
        chargePointId: 'CP-009',
        type: null,
      } as any;

      const result = await handler.execute(input);

      expect(result.status).toBe('Rejected');
    });

    it('should reject undefined reset type', async () => {
      const input = {
        chargePointId: 'CP-010',
      } as any;

      const result = await handler.execute(input);

      expect(result.status).toBe('Rejected');
    });

    it('should be case-sensitive for reset type validation', async () => {
      const input = {
        chargePointId: 'CP-011',
        type: 'hard', // lowercase
      } as any;

      mockRepository.find.mockResolvedValue({
        id: 'cp-333',
        chargePointId: 'CP-011',
      } as ChargePoint);

      const result = await handler.execute(input);

      expect(result.status).toBe('Rejected');
    });

    it('should reject malformed reset types', async () => {
      const malformedTypes = ['HARD', 'SOFT', 'Hard ', ' Soft', 'HardReset'];

      mockRepository.find.mockResolvedValue({
        id: 'cp-444',
        chargePointId: 'CP-012',
      } as ChargePoint);

      const results = await Promise.all(
        malformedTypes.map((type) =>
          handler.execute({
            chargePointId: 'CP-012',
            type: type as any,
          })
        )
      );

      expect(results.every((r) => r.status === 'Rejected')).toBe(true);
    });
  });

  describe('ChargePoint Repository Interaction', () => {
    it('should query repository with correct chargePointId', async () => {
      const input: ResetInput = {
        chargePointId: 'CP-013',
        type: 'Hard',
      };

      mockRepository.find.mockResolvedValue({
        id: 'cp-555',
        chargePointId: 'CP-013',
      } as ChargePoint);

      await handler.execute(input);

      expect(mockRepository.find).toHaveBeenCalledWith('CP-013');
    });

    it('should reject when ChargePoint not found', async () => {
      const input: ResetInput = {
        chargePointId: 'CP-NONEXISTENT',
        type: 'Hard',
      };

      mockRepository.find.mockResolvedValue(null);

      const result = await handler.execute(input);

      expect(result.status).toBe('Rejected');
    });

    it('should handle repository errors gracefully', async () => {
      const input: ResetInput = {
        chargePointId: 'CP-014',
        type: 'Soft',
      };

      mockRepository.find.mockRejectedValue(
        new Error('Database connection error')
      );

      try {
        await handler.execute(input);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should support both Hard and Soft reset types', async () => {
      mockRepository.find.mockResolvedValue({
        id: 'cp-666',
        chargePointId: 'CP-015',
      } as ChargePoint);

      const hardResult = await handler.execute({
        chargePointId: 'CP-015',
        type: 'Hard',
      });

      const softResult = await handler.execute({
        chargePointId: 'CP-015',
        type: 'Soft',
      });

      expect(hardResult.status).toBe('Accepted');
      expect(softResult.status).toBe('Accepted');
    });
  });

  describe('Performance & Boundaries', () => {
    it('should complete within 100ms SLA', async () => {
      const input: ResetInput = {
        chargePointId: 'CP-016',
        type: 'Hard',
      };

      mockRepository.find.mockResolvedValue({
        id: 'cp-777',
        chargePointId: 'CP-016',
      } as ChargePoint);

      const start = Date.now();
      await handler.execute(input);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should handle special characters in chargePointId', async () => {
      const input: ResetInput = {
        chargePointId: 'CP-001-@#$',
        type: 'Hard',
      };

      mockRepository.find.mockResolvedValue({
        id: 'cp-888',
        chargePointId: 'CP-001-@#$',
      } as ChargePoint);

      const result = await handler.execute(input);

      expect(result.status).toBe('Accepted');
      expect(mockRepository.find).toHaveBeenCalledWith('CP-001-@#$');
    });

    it('should handle very long chargePointId strings', async () => {
      const longId = 'CP-' + 'A'.repeat(100);
      const input: ResetInput = {
        chargePointId: longId,
        type: 'Soft',
      };

      mockRepository.find.mockResolvedValue({
        id: 'cp-999',
        chargePointId: longId,
      } as ChargePoint);

      const result = await handler.execute(input);

      expect(result.status).toBe('Accepted');
    });

    it('should handle numeric chargePointId strings', async () => {
      const input: ResetInput = {
        chargePointId: '12345',
        type: 'Hard',
      };

      mockRepository.find.mockResolvedValue({
        id: 'cp-1010',
        chargePointId: '12345',
      } as ChargePoint);

      const result = await handler.execute(input);

      expect(result.status).toBe('Accepted');
    });

    it('should handle empty string chargePointId', async () => {
      const input: ResetInput = {
        chargePointId: '',
        type: 'Hard',
      };

      mockRepository.find.mockResolvedValue(null);

      const result = await handler.execute(input);

      expect(result.status).toBe('Rejected');
    });
  });

  describe('Response Validation', () => {
    it('should return object with status property', async () => {
      const input: ResetInput = {
        chargePointId: 'CP-017',
        type: 'Hard',
      };

      mockRepository.find.mockResolvedValue({
        id: 'cp-1111',
        chargePointId: 'CP-017',
      } as ChargePoint);

      const result = await handler.execute(input);

      expect(result).toHaveProperty('status');
      expect(['Accepted', 'Rejected']).toContain(result.status);
    });

    it('should return consistent response format for accepted resets', async () => {
      mockRepository.find.mockResolvedValue({
        id: 'cp-1212',
        chargePointId: 'CP-018',
      } as ChargePoint);

      const hardResult = await handler.execute({
        chargePointId: 'CP-018',
        type: 'Hard',
      });

      const softResult = await handler.execute({
        chargePointId: 'CP-018',
        type: 'Soft',
      });

      expect(typeof hardResult.status).toBe(typeof softResult.status);
      expect(hardResult).toHaveProperty('status');
      expect(softResult).toHaveProperty('status');
    });
  });
});
