import { Test, TestingModule } from '@nestjs/testing';
import { HandleAuthorize } from '@/application/use-cases/HandleAuthorize';
import { IChargePointRepository } from '@/domain/repositories/IChargePointRepository';
import { OcppContext } from '@/domain/value-objects/OcppContext';
import { OcppCallRequest } from '@/application/dto/OcppProtocol';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '@/infrastructure/tokens';

describe('HandleAuthorize', () => {
  let handler: HandleAuthorize;
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
        HandleAuthorize,
        {
          provide: CHARGE_POINT_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    handler = module.get<HandleAuthorize>(HandleAuthorize);
  });

  describe('Happy Path - Valid Authorization', () => {
    it('should authorize valid idTag', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-001',
        action: 'Authorize',
        payload: { idTag: 'VALID-TAG' },
      };

      const context = new OcppContext('CP-001', 'msg-001');
      const result = (await handler.execute(message, context)) as any;

      expect(result).toEqual([
        3,
        'msg-001',
        expect.objectContaining({
          idTagInfo: expect.objectContaining({
            status: 'Accepted',
          }),
        }),
      ]);
    });

    it('should include expiryDate in response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-002',
        action: 'Authorize',
        payload: { idTag: 'TAG-123' },
      };

      const context = new OcppContext('CP-001', 'msg-002');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].idTagInfo).toHaveProperty('expiryDate');
      expect(new Date(result[2].idTagInfo.expiryDate)).toBeInstanceOf(Date);
    });

    it('should return [3, messageId, {...}] format per OCPP 1.6', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-003',
        action: 'Authorize',
        payload: { idTag: 'TEST' },
      };

      const context = new OcppContext('CP-001', 'msg-003');
      const result = (await handler.execute(message, context)) as any;

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      expect(result[0]).toBe(3);
      expect(typeof result[1]).toBe('string');
      expect(typeof result[2]).toBe('object');
    });
  });

  describe('Invalid idTag Cases', () => {
    it('should reject empty idTag', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-004',
        action: 'Authorize',
        payload: { idTag: '' },
      };

      const context = new OcppContext('CP-001', 'msg-004');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].idTagInfo.status).toBe('Invalid');
    });

    it('should reject idTag shorter than 3 chars', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-005',
        action: 'Authorize',
        payload: { idTag: 'AB' },
      };

      const context = new OcppContext('CP-001', 'msg-005');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].idTagInfo.status).toBe('Invalid');
    });

    it('should reject idTag longer than 20 chars', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-006',
        action: 'Authorize',
        payload: { idTag: 'A'.repeat(21) },
      };

      const context = new OcppContext('CP-001', 'msg-006');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4);
      expect(result[2]).toBe('FormationViolation');
    });

    it('should block known blocked tags', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-007',
        action: 'Authorize',
        payload: { idTag: 'BLOCKED' },
      };

      const context = new OcppContext('CP-001', 'msg-007');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].idTagInfo.status).toBe('Blocked');
    });

    it('should handle case insensitive blocked tags', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-008',
        action: 'Authorize',
        payload: { idTag: 'blocked' },
      };

      const context = new OcppContext('CP-001', 'msg-008');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].idTagInfo.status).toBe('Blocked');
    });

    it('should mark expired tags', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-009',
        action: 'Authorize',
        payload: { idTag: 'EXPIRED' },
      };

      const context = new OcppContext('CP-001', 'msg-009');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].idTagInfo.status).toBe('Expired');
    });
  });

  describe('Message Format Validation', () => {
    it('should preserve messageId in response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'unique-msg-456',
        action: 'Authorize',
        payload: { idTag: 'TAG' },
      };

      const context = new OcppContext('CP-001', 'unique-msg-456');
      const result = (await handler.execute(message, context)) as any;

      expect(result[1]).toBe('unique-msg-456');
    });

    it('should handle various messageId formats', async () => {
      const formats = ['1', '123', 'abc-123', 'UUID-xxxxxxxx'];

      for (const msgId of formats) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: msgId,
          action: 'Authorize',
          payload: { idTag: 'TAG' },
        };

        const context = new OcppContext('CP-001', msgId);
        const result = (await handler.execute(message, context)) as any;

        expect(result[1]).toBe(msgId);
      }
    });

    it('should validate messageTypeId is CALL (2)', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-010',
        action: 'Authorize',
        payload: { idTag: 'TAG' },
      };

      const context = new OcppContext('CP-001', 'msg-010');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });
  });

  describe('Context Validation', () => {
    it('should require chargePointId in context', () => {
      expect(() => {
        new OcppContext('', 'msg-011');
      }).toThrow();
    });

    it('should require messageId in context', () => {
      expect(() => {
        new OcppContext('CP-001', '');
      }).toThrow();
    });

    it('should accept optional sourceIp', () => {
      const context = new OcppContext('CP-001', 'msg-012', '192.168.1.1');

      expect(context.sourceIp).toBe('192.168.1.1');
    });

    it('should set timestamp on context creation', () => {
      const before = new Date();
      const context = new OcppContext('CP-001', 'msg-013');
      const after = new Date();

      expect(context.timestamp).toBeInstanceOf(Date);
      expect(context.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(context.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should accept custom timestamp', () => {
      const customDate = new Date('2024-01-01T00:00:00Z');
      const context = new OcppContext('CP-001', 'msg-014', undefined, customDate);

      expect(context.timestamp).toEqual(customDate);
    });
  });

  describe('OCPP 1.6 Specification Compliance', () => {
    it('should return only valid AuthorizationStatus values', async () => {
      const validStatuses = ['Accepted', 'Blocked', 'Expired', 'Invalid'];

      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-015',
        action: 'Authorize',
        payload: { idTag: 'VALID' },
      };

      const context = new OcppContext('CP-001', 'msg-015');
      const result = (await handler.execute(message, context)) as any;

      expect(validStatuses).toContain(result[2].idTagInfo.status);
    });

    it('should return idTagInfo with status property', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-016',
        action: 'Authorize',
        payload: { idTag: 'TAG' },
      };

      const context = new OcppContext('CP-001', 'msg-016');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2]).toHaveProperty('idTagInfo');
      expect(result[2].idTagInfo).toHaveProperty('status');
    });

    it('should return ISO 8601 timestamp format', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-017',
        action: 'Authorize',
        payload: { idTag: 'TAG' },
      };

      const context = new OcppContext('CP-001', 'msg-017');
      const result = (await handler.execute(message, context)) as any;

      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      expect(result[2].idTagInfo.expiryDate).toMatch(iso8601Regex);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing payload fields', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-018',
        action: 'Authorize',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'msg-018');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4);
      expect(result[2]).toBe('FormationViolation');
    });

    it('should handle null payload safely', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-019',
        action: 'Authorize',
        payload: null as any,
      };

      const context = new OcppContext('CP-001', 'msg-019');

      try {
        const result = (await handler.execute(message, context)) as any;
        expect([3, 4]).toContain(result[0]);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should return valid response for unexpected data', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-020',
        action: 'Authorize',
        payload: { idTag: 'TAG' },
      };

      const context = new OcppContext('CP-001', 'msg-020');
      const result = (await handler.execute(message, context)) as any;

      expect(Array.isArray(result)).toBe(true);
      expect([3, 4]).toContain(result[0]);
    });
  });

  describe('Performance', () => {
    it('should complete authorization within 100ms SLA', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-021',
        action: 'Authorize',
        payload: { idTag: 'TAG' },
      };

      const context = new OcppContext('CP-001', 'msg-021');
      const start = Date.now();
      const result = (await handler.execute(message, context)) as any;
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle rapid sequential requests', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `msg-seq-${i}`,
          action: 'Authorize',
          payload: { idTag: 'TAG' },
        };
        const context = new OcppContext('CP-001', `msg-seq-${i}`);
        return handler.execute(message, context);
      });

      const results = await Promise.all(requests);

      expect(results).toHaveLength(10);
      results.forEach((result) => {
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe('Boundary Cases', () => {
    it('should accept exactly 3-char idTag', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-022',
        action: 'Authorize',
        payload: { idTag: 'ABC' },
      };

      const context = new OcppContext('CP-001', 'msg-022');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].idTagInfo.status).toBe('Accepted');
    });

    it('should accept exactly 20-char idTag', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-023',
        action: 'Authorize',
        payload: { idTag: 'A'.repeat(20) },
      };

      const context = new OcppContext('CP-001', 'msg-023');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].idTagInfo.status).toBe('Accepted');
    });

    it('should handle special characters in idTag', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-024',
        action: 'Authorize',
        payload: { idTag: 'TAG-123_456' },
      };

      const context = new OcppContext('CP-001', 'msg-024');
      const result = (await handler.execute(message, context)) as any;

      expect([3, 4]).toContain(result[0]);
    });

    it('should handle numeric idTag strings', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'msg-025',
        action: 'Authorize',
        payload: { idTag: '1234567890' },
      };

      const context = new OcppContext('CP-001', 'msg-025');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].idTagInfo.status).toBe('Accepted');
    });
  });
});
