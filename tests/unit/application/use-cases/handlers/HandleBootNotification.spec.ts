import { Test, TestingModule } from '@nestjs/testing';

import { CHARGE_POINT_REPOSITORY_TOKEN } from '@/infrastructure/tokens';
import { ChargePoint } from '@/domain/entities/ChargePoint.entity';
import { HandleBootNotification } from '@/application/use-cases/HandleBootNotification';
import { IChargePointRepository } from '@/domain/repositories/IChargePointRepository';
import { OcppCallRequest } from '@/application/dto/OcppProtocol';
import { OcppContext } from '@/domain/value-objects/OcppContext';

describe('HandleBootNotification', () => {
  let handler: HandleBootNotification;
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
        HandleBootNotification,
        {
          provide: CHARGE_POINT_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    handler = module.get<HandleBootNotification>(HandleBootNotification);
  });

  describe('Happy Path - Valid BootNotification', () => {
    it('should accept BootNotification when ChargePoint exists', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'boot-001',
        action: 'BootNotification',
        payload: {
          chargePointVendor: 'Tesla Inc',
          chargePointModel: 'Model S Charger',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-123',
        chargePointId: 'CP-001',
      } as ChargePoint);

      const context = new OcppContext('CP-001', 'boot-001');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
      expect(result[1]).toBe('boot-001');
      expect(result[2]).toHaveProperty('status');
      expect(result[2]).toHaveProperty('currentTime');
      expect(result[2]).toHaveProperty('interval');
    });

    it('should return Accepted status for valid notification', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'boot-002',
        action: 'BootNotification',
        payload: {
          chargePointVendor: 'ABB',
          chargePointModel: 'ACE3000',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-456',
        chargePointId: 'CP-002',
      } as ChargePoint);

      const context = new OcppContext('CP-002', 'boot-002');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].status).toBe('Accepted');
    });

    it('should return interval of 900 seconds', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'boot-003',
        action: 'BootNotification',
        payload: {
          chargePointVendor: 'Siemens',
          chargePointModel: 'VersiCharge',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-789',
        chargePointId: 'CP-003',
      } as ChargePoint);

      const context = new OcppContext('CP-003', 'boot-003');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].interval).toBe(900);
    });

    it('should return ISO 8601 formatted currentTime', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'boot-004',
        action: 'BootNotification',
        payload: {
          chargePointVendor: 'Nissan',
          chargePointModel: 'Leaf Charger',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-999',
        chargePointId: 'CP-004',
      } as ChargePoint);

      const context = new OcppContext('CP-004', 'boot-004');
      const result = (await handler.execute(message, context)) as any;

      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      expect(result[2].currentTime).toMatch(iso8601Regex);
    });

    it('should preserve messageId in response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'unique-boot-msg-xyz',
        action: 'BootNotification',
        payload: {
          chargePointVendor: 'Tesla',
          chargePointModel: 'Wall Connector',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-111',
        chargePointId: 'CP-005',
      } as ChargePoint);

      const context = new OcppContext('CP-005', 'unique-boot-msg-xyz');
      const result = (await handler.execute(message, context)) as any;

      expect(result[1]).toBe('unique-boot-msg-xyz');
    });
  });

  describe('Message Format Validation', () => {
    it('should return CALLRESULT (3) for valid message', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'boot-006',
        action: 'BootNotification',
        payload: {
          chargePointVendor: 'Vendor A',
          chargePointModel: 'Model A',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-222',
        chargePointId: 'CP-006',
      } as ChargePoint);

      const context = new OcppContext('CP-006', 'boot-006');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
      expect(result.length).toBe(3);
    });

    it('should return error for invalid messageTypeId', async () => {
      const message = {
        messageTypeId: 99,
        messageId: 'boot-007',
        action: 'BootNotification',
        payload: {
          chargePointVendor: 'Tesla',
          chargePointModel: 'Model 3',
        },
      } as any;

      const context = new OcppContext('CP-007', 'boot-007');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4);
    });

    it('should require chargePointVendor in payload', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'boot-008',
        action: 'BootNotification',
        payload: {
          chargePointModel: 'Model',
        } as any,
      };

      const context = new OcppContext('CP-008', 'boot-008');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4);
      expect(result[2]).toBe('FormationViolation');
    });

    it('should require chargePointModel in payload', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'boot-009',
        action: 'BootNotification',
        payload: {
          chargePointVendor: 'Vendor',
        } as any,
      };

      const context = new OcppContext('CP-009', 'boot-009');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4);
    });
  });

  describe('ChargePoint Lookup', () => {
    it('should query repository with correct chargePointId', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'boot-010',
        action: 'BootNotification',
        payload: {
          chargePointVendor: 'Tesla',
          chargePointModel: 'Supercharger',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-333',
        chargePointId: 'CP-010',
      } as ChargePoint);

      const context = new OcppContext('CP-010', 'boot-010');
      await handler.execute(message, context);

      expect(mockRepository.findByChargePointId).toHaveBeenCalledWith('CP-010');
    });

    it('should return error when ChargePoint not found', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'boot-011',
        action: 'BootNotification',
        payload: {
          chargePointVendor: 'Unknown',
          chargePointModel: 'Unknown',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue(null);

      const context = new OcppContext('CP-NONEXISTENT', 'boot-011');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4);
      expect(result[2]).toBe('GenericError');
    });

    it('should handle repository errors gracefully', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'boot-012',
        action: 'BootNotification',
        payload: {
          chargePointVendor: 'Tesla',
          chargePointModel: 'Model X',
        },
      };

      mockRepository.findByChargePointId.mockRejectedValue(new Error('Database connection error'));

      const context = new OcppContext('CP-012', 'boot-012');

      try {
        await handler.execute(message, context);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Response Format Compliance', () => {
    it('should return array with 3 elements', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'boot-013',
        action: 'BootNotification',
        payload: {
          chargePointVendor: 'Siemens',
          chargePointModel: 'SICHARGE',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-444',
        chargePointId: 'CP-013',
      } as ChargePoint);

      const context = new OcppContext('CP-013', 'boot-013');
      const result = (await handler.execute(message, context)) as any;

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
    });

    it('should have correct payload object properties', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'boot-014',
        action: 'BootNotification',
        payload: {
          chargePointVendor: 'Vendor B',
          chargePointModel: 'Model B',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-555',
        chargePointId: 'CP-014',
      } as ChargePoint);

      const context = new OcppContext('CP-014', 'boot-014');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2]).toHaveProperty('status');
      expect(result[2]).toHaveProperty('currentTime');
      expect(result[2]).toHaveProperty('interval');
      expect(typeof result[2].status).toBe('string');
      expect(typeof result[2].currentTime).toBe('string');
      expect(typeof result[2].interval).toBe('number');
    });
  });

  describe('Performance', () => {
    it('should complete within 100ms SLA', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'boot-015',
        action: 'BootNotification',
        payload: {
          chargePointVendor: 'Tesla',
          chargePointModel: 'Model S',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-666',
        chargePointId: 'CP-015',
      } as ChargePoint);

      const context = new OcppContext('CP-015', 'boot-015');
      const start = Date.now();
      await handler.execute(message, context);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should handle multiple consecutive requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `boot-seq-${i}`,
          action: 'BootNotification',
          payload: {
            chargePointVendor: 'Tesla',
            chargePointModel: `Model ${i}`,
          },
        };
        const context = new OcppContext(`CP-016-${i}`, `boot-seq-${i}`);
        return handler.execute(message, context);
      });

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-777',
        chargePointId: 'CP-016',
      } as ChargePoint);

      const results = await Promise.all(requests);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe('Boundary Cases', () => {
    it('should reject vendor string with spaces if schema forbids it', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'boot-017',
        action: 'BootNotification',
        payload: {
          chargePointVendor: 'Tesla Inc Company Ltd',
          chargePointModel: 'Super Model X',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-888',
        chargePointId: 'CP-017',
      } as ChargePoint);

      const context = new OcppContext('CP-017', 'boot-017');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4);
      expect(result[2]).toBe('FormationViolation');
    });

    it('should handle very long vendor/model strings', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'boot-018',
        action: 'BootNotification',
        payload: {
          chargePointVendor: 'A'.repeat(100),
          chargePointModel: 'B'.repeat(100),
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-999',
        chargePointId: 'CP-018',
      } as ChargePoint);

      const context = new OcppContext('CP-018', 'boot-018');
      const result = (await handler.execute(message, context)) as any;

      expect([3, 4]).toContain(result[0]);
    });

    it('should handle special characters in vendor/model', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'boot-019',
        action: 'BootNotification',
        payload: {
          chargePointVendor: 'Vendor@123#',
          chargePointModel: 'Model-X-2024',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-1010',
        chargePointId: 'CP-019',
      } as ChargePoint);

      const context = new OcppContext('CP-019', 'boot-019');
      const result = (await handler.execute(message, context)) as any;

      expect([3, 4]).toContain(result[0]);
    });

    it('should handle numeric vendor/model strings', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'boot-020',
        action: 'BootNotification',
        payload: {
          chargePointVendor: '123456',
          chargePointModel: '789012',
        },
      };

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'cp-1111',
        chargePointId: 'CP-020',
      } as ChargePoint);

      const context = new OcppContext('CP-020', 'boot-020');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });
  });
});
