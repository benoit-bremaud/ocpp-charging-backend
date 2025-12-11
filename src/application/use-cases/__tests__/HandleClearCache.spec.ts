import { Test, TestingModule } from '@nestjs/testing';
import { HandleClearCache } from '../HandleClearCache';
import { OcppContext } from '../../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../../dto/OcppProtocol';

describe('HandleClearCache', () => {
  let handler: HandleClearCache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleClearCache],
    }).compile();

    handler = module.get<HandleClearCache>(HandleClearCache);
  });

  describe('Happy Path - Valid ClearCache', () => {
    it('should accept ClearCache request', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'cc-001',
        action: 'ClearCache',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'cc-001');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3); // CALLRESULT
      expect(result[1]).toBe('cc-001'); // messageId
      expect(result[2].status).toBe('Accepted');
    });

    it('should preserve messageId in response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'cc-unique-123',
        action: 'ClearCache',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'cc-unique-123');
      const result = (await handler.execute(message, context)) as any;

      expect(result[1]).toBe('cc-unique-123');
    });

    it('should return array with 3 elements', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'cc-002',
        action: 'ClearCache',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'cc-002');
      const result = (await handler.execute(message, context)) as any;

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
    });

    it('should return status property', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'cc-003',
        action: 'ClearCache',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'cc-003');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2]).toHaveProperty('status');
      expect(['Accepted', 'Rejected']).toContain(result[2].status);
    });
  });

  describe('Message Format Validation', () => {
    it('should reject invalid messageTypeId', async () => {
      // ✅ FIX: Cast to any to test invalid input
      const message = {
        messageTypeId: 3,
        messageId: 'cc-004',
        action: 'ClearCache',
        payload: {},
      } as any as OcppCallRequest;

      const context = new OcppContext('CP-001', 'cc-004');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4); // CALLERROR
      expect(result[2]).toBe('GenericError');
    });

    it('should handle CALL messageTypeId 2', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'cc-005',
        action: 'ClearCache',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'cc-005');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3); // CALLRESULT
    });
  });

  describe('Context Validation', () => {
    it('should accept valid OcppContext', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'cc-006',
        action: 'ClearCache',
        payload: {},
      };

      const context = new OcppContext('CP-VALID', 'cc-006');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should work with different chargePointIds', async () => {
      const chargePointIds = ['CP-001', 'CP-002', 'CP-MULTI'];

      for (const cpId of chargePointIds) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `cc-${cpId}`,
          action: 'ClearCache',
          payload: {},
        };

        const context = new OcppContext(cpId, `cc-${cpId}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
      }
    });
  });

  describe('Performance & Boundaries', () => {
    it('should complete within 100ms SLA', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'cc-perf',
        action: 'ClearCache',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'cc-perf');
      const start = performance.now();

      await handler.execute(message, context);

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent requests', async () => {
      // ✅ FIX: Use proper typing
      const messages: OcppCallRequest[] = Array.from({ length: 5 }, (_, i) => ({
        messageTypeId: 2,
        messageId: `cc-concurrent-${i}`,
        action: 'ClearCache',
        payload: {},
      })) as any;

      const contexts = messages.map((msg) => new OcppContext('CP-001', msg.messageId));

      const results = await Promise.all(
        messages.map((msg, idx) => handler.execute(msg, contexts[idx])),
      );

      expect(results).toHaveLength(5);
      results.forEach((result: any) => {
        expect(result[0]).toBe(3);
      });
    });

    it('should handle empty payload object', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'cc-empty-payload',
        action: 'ClearCache',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'cc-empty-payload');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });
  });

  describe('OCPP 1.6 Compliance', () => {
    it('should return OCPP wire format [3, id, {...}]', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'cc-compliance',
        action: 'ClearCache',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'cc-compliance');
      const result = (await handler.execute(message, context)) as any;

      // OCPP wire format: [messageTypeId, uniqueId, payload]
      expect(typeof result[0]).toBe('number');
      expect(typeof result[1]).toBe('string');
      expect(typeof result[2]).toBe('object');
    });

    it('should always return Accepted status for valid request', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'cc-status',
        action: 'ClearCache',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'cc-status');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].status).toBe('Accepted');
    });
  });
});
