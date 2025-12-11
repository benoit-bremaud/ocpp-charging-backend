import { Test, TestingModule } from '@nestjs/testing';
import { HandleStopTransaction } from '../HandleStopTransaction';
import { OcppContext } from '../../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../../dto/OcppProtocol';

describe('HandleStopTransaction', () => {
  let handler: HandleStopTransaction;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleStopTransaction],
    }).compile();

    handler = module.get<HandleStopTransaction>(HandleStopTransaction);
  });

  describe('Happy Path - Valid StopTransaction', () => {
    it('should accept StopTransaction request', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'stp-001',
        action: 'StopTransaction',
        payload: {
          transactionId: 12345,
          meterStop: 1000,
          timestamp: '2025-12-11T17:10:00Z',
        },
      };

      const context = new OcppContext('CP-001', 'stp-001');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3); // CALLRESULT
      expect(result[1]).toBe('stp-001');
      expect(result[2].idTagInfo.status).toBe('Accepted');
    });

    it('should accept with all optional fields', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'stp-002',
        action: 'StopTransaction',
        payload: {
          transactionId: 67890,
          meterStop: 5500,
          timestamp: '2025-12-11T17:15:00Z',
          reason: 'Local',
        },
      };

      const context = new OcppContext('CP-001', 'stp-002');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
      expect(result[2].idTagInfo.status).toBe('Accepted');
    });

    it('should accept with minimal payload', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'stp-003',
        action: 'StopTransaction',
        payload: {
          transactionId: 11111,
        },
      };

      const context = new OcppContext('CP-001', 'stp-003');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
      expect(result[2].idTagInfo).toBeDefined();
    });

    it('should preserve messageId in response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'stp-unique-999',
        action: 'StopTransaction',
        payload: {
          transactionId: 22222,
          meterStop: 2000,
        },
      };

      const context = new OcppContext('CP-001', 'stp-unique-999');
      const result = (await handler.execute(message, context)) as any;

      expect(result[1]).toBe('stp-unique-999');
    });
  });

  describe('Message Format Validation', () => {
    it('should reject invalid messageTypeId', async () => {
      const message = {
        messageTypeId: 3,
        messageId: 'stp-004',
        action: 'StopTransaction',
        payload: { transactionId: 33333 },
      } as any as OcppCallRequest;

      const context = new OcppContext('CP-001', 'stp-004');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4); // CALLERROR
      expect(result[2]).toBe('GenericError');
    });

    it('should return array with 3 elements for success', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'stp-005',
        action: 'StopTransaction',
        payload: { transactionId: 44444 },
      };

      const context = new OcppContext('CP-001', 'stp-005');
      const result = (await handler.execute(message, context)) as any;

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
    });
  });

  describe('Transaction ID Handling', () => {
    it('should handle various transaction IDs', async () => {
      const transactionIds = [1, 100, 999999, 2147483647];

      for (const transactionId of transactionIds) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `stp-txn-${transactionId}`,
          action: 'StopTransaction',
          payload: { transactionId },
        };

        const context = new OcppContext('CP-001', `stp-txn-${transactionId}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
        expect(result[2].idTagInfo.status).toBe('Accepted');
      }
    });

    it('should handle different meter values', async () => {
      const meterValues = [0, 1000, 10000, 999999];

      for (const meterStop of meterValues) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `stp-meter-${meterStop}`,
          action: 'StopTransaction',
          payload: { transactionId: 12345, meterStop },
        };

        const context = new OcppContext('CP-001', `stp-meter-${meterStop}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
      }
    });
  });

  describe('Performance & Concurrency', () => {
    it('should complete within 100ms SLA', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'stp-perf',
        action: 'StopTransaction',
        payload: { transactionId: 55555, meterStop: 7000 },
      };

      const context = new OcppContext('CP-001', 'stp-perf');
      const start = performance.now();

      await handler.execute(message, context);

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent stop requests', async () => {
      const messages: OcppCallRequest[] = Array.from({ length: 5 }, (_, i) => ({
        messageTypeId: 2,
        messageId: `stp-concurrent-${i}`,
        action: 'StopTransaction',
        payload: { transactionId: 60000 + i, meterStop: 3000 + i * 100 },
      })) as any;

      const contexts = messages.map(
        (msg) => new OcppContext('CP-001', msg.messageId),
      );

      const results = await Promise.all(
        messages.map((msg, idx) => handler.execute(msg, contexts[idx])),
      );

      expect(results).toHaveLength(5);
      results.forEach((result: any) => {
        expect(result[0]).toBe(3);
      });
    });
  });

  describe('OCPP 1.6 Compliance', () => {
    it('should return OCPP wire format [3, id, {...}]', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'stp-compliance',
        action: 'StopTransaction',
        payload: { transactionId: 77777, meterStop: 5555 },
      };

      const context = new OcppContext('CP-001', 'stp-compliance');
      const result = (await handler.execute(message, context)) as any;

      expect(typeof result[0]).toBe('number');
      expect(typeof result[1]).toBe('string');
      expect(typeof result[2]).toBe('object');
    });

    it('should always include idTagInfo in response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'stp-idtaginfo',
        action: 'StopTransaction',
        payload: { transactionId: 88888 },
      };

      const context = new OcppContext('CP-001', 'stp-idtaginfo');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].idTagInfo).toBeDefined();
      expect(result[2].idTagInfo.status).toBe('Accepted');
    });
  });
});
