import { Test, TestingModule } from '@nestjs/testing';

import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../../infrastructure/tokens';
import { ChargePoint } from '../../../domain/entities/ChargePoint.entity';
import { HandleDataTransfer } from '../HandleDataTransfer';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { OcppCallRequest } from '../../dto/OcppProtocol';
import { OcppContext } from '../../../domain/value-objects/OcppContext';

describe('HandleDataTransfer', () => {
  let handler: HandleDataTransfer;
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
        HandleDataTransfer,
        {
          provide: CHARGE_POINT_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    handler = module.get<HandleDataTransfer>(HandleDataTransfer);
  });

  describe('Happy Path - Valid DataTransfer', () => {
    it('should accept DataTransfer with vendorId', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-001',
        action: 'DataTransfer',
        payload: {
          vendorId: 'vendor.com',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-123',
        chargePointId: 'CP-001',
      } as ChargePoint);

      const context = new OcppContext('CP-001', 'dt-001');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
      expect(result[1]).toBe('dt-001');
      expect(result[2]).toHaveProperty('status');
    });

    it('should return Accepted status for valid transfer', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-002',
        action: 'DataTransfer',
        payload: {
          vendorId: 'charge.io',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-456',
        chargePointId: 'CP-002',
      } as ChargePoint);

      const context = new OcppContext('CP-002', 'dt-002');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].status).toBe('Accepted');
    });

    it('should preserve messageId in response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'unique-dt-12345',
        action: 'DataTransfer',
        payload: {
          vendorId: 'test.vendor',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-789',
        chargePointId: 'CP-003',
      } as ChargePoint);

      const context = new OcppContext('CP-003', 'unique-dt-12345');
      const result = (await handler.execute(message, context)) as any;

      expect(result[1]).toBe('unique-dt-12345');
    });

    it('should accept DataTransfer with optional data field', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-004',
        action: 'DataTransfer',
        payload: {
          vendorId: 'vendor.org',
          data: '{"key":"value"}',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-999',
        chargePointId: 'CP-004',
      } as ChargePoint);

      const context = new OcppContext('CP-004', 'dt-004');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should handle multiple consecutive DataTransfers', async () => {
      const messages = Array.from({ length: 3 }, (_, i) => ({
        messageTypeId: 2 as const,
        messageId: `dt-seq-${i}`,
        action: 'DataTransfer' as const,
        payload: {
          vendorId: `vendor${i}.com`,
        },
      }));

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-1111',
        chargePointId: 'CP-005',
      } as ChargePoint);

      const context = new OcppContext('CP-005', 'dt-seq');
      const results = await Promise.all(messages.map((msg) => handler.execute(msg, context)));

      expect(results).toHaveLength(3);
      expect(results.every((r: any) => r[0] === 3)).toBe(true);
    });
  });

  describe('Message Format Validation', () => {
    it('should return CALLRESULT (3) for valid message', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-006',
        action: 'DataTransfer',
        payload: {
          vendorId: 'valid.vendor',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-2222',
        chargePointId: 'CP-006',
      } as ChargePoint);

      const context = new OcppContext('CP-006', 'dt-006');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
      expect(result.length).toBe(3);
    });

    it('should return error for invalid messageTypeId', async () => {
      const message = {
        messageTypeId: 99,
        messageId: 'dt-007',
        action: 'DataTransfer',
        payload: {
          vendorId: 'vendor.com',
        },
      } as any;

      const context = new OcppContext('CP-007', 'dt-007');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4);
    });

    it('should reject missing vendorId', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-008',
        action: 'DataTransfer',
        payload: {} as any,
      };

      const context = new OcppContext('CP-008', 'dt-008');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4);
    });
  });

  describe('ChargePoint Lookup', () => {
    it('should query repository with correct chargePointId', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-009',
        action: 'DataTransfer',
        payload: {
          vendorId: 'test.com',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-3333',
        chargePointId: 'CP-009',
      } as ChargePoint);

      const context = new OcppContext('CP-009', 'dt-009');
      await handler.execute(message, context);

      expect(mockRepository.findByChargePointId).toHaveBeenCalledWith('CP-009');
    });

    it('should return error when ChargePoint not found', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-010',
        action: 'DataTransfer',
        payload: {
          vendorId: 'unknown.vendor',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue(null);

      const context = new OcppContext('CP-NONEXISTENT', 'dt-010');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4);
      //   expect(result[2]).toContain('not found');
      expect(result[2]).toBe('GenericError');
    });
  });

  describe('Response Format', () => {
    it('should return array with 3 elements', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-011',
        action: 'DataTransfer',
        payload: {
          vendorId: 'format.test',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-4444',
        chargePointId: 'CP-011',
      } as ChargePoint);

      const context = new OcppContext('CP-011', 'dt-011');
      const result = (await handler.execute(message, context)) as any;

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
    });

    it('should return correct payload structure', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-012',
        action: 'DataTransfer',
        payload: {
          vendorId: 'struct.vendor',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-5555',
        chargePointId: 'CP-012',
      } as ChargePoint);

      const context = new OcppContext('CP-012', 'dt-012');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2]).toHaveProperty('status');
      expect(typeof result[2].status).toBe('string');
    });
  });

  describe('Performance & Boundaries', () => {
    it('should complete within 100ms SLA', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-013',
        action: 'DataTransfer',
        payload: {
          vendorId: 'perf.test',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-6666',
        chargePointId: 'CP-013',
      } as ChargePoint);

      const context = new OcppContext('CP-013', 'dt-013');
      const start = Date.now();
      await handler.execute(message, context);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should handle very long vendorId strings', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-014',
        action: 'DataTransfer',
        payload: {
          vendorId: 'v'.repeat(200) + '.com',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-7777',
        chargePointId: 'CP-014',
      } as ChargePoint);

      const context = new OcppContext('CP-014', 'dt-014');
      const result = (await handler.execute(message, context)) as any;

      expect([3, 4]).toContain(result[0]);
    });

    it('should handle special characters in vendorId', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-015',
        action: 'DataTransfer',
        payload: {
          vendorId: 'vendor@123#test.org',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-8888',
        chargePointId: 'CP-015',
      } as ChargePoint);

      const context = new OcppContext('CP-015', 'dt-015');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });
  });
});
