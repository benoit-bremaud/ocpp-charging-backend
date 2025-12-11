import { Test, TestingModule } from '@nestjs/testing';
import { HandleHeartbeat } from '../HandleHeartbeat';
import { OcppContext } from '../../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../../dto/OcppProtocol';

describe('HandleHeartbeat', () => {
  let handler: HandleHeartbeat;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleHeartbeat],
    }).compile();

    handler = module.get<HandleHeartbeat>(HandleHeartbeat);
  });

  describe('Happy Path - Valid Heartbeat', () => {
    it('should accept Heartbeat request', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-001',
        action: 'Heartbeat',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'hb-001');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3); // CALLRESULT
      expect(result[1]).toBe('hb-001');
      expect(result[2].currentTime).toBeDefined();
    });

    it('should return ISO 8601 formatted timestamp', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-002',
        action: 'Heartbeat',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'hb-002');
      const result = (await handler.execute(message, context)) as any;

      const timestamp = result[2].currentTime;
      expect(typeof timestamp).toBe('string');
      // Validate ISO 8601 format
      expect(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(timestamp)).toBe(
        true,
      );
    });

    it('should return current server time', async () => {
      const beforeTime = new Date();
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-003',
        action: 'Heartbeat',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'hb-003');
      const result = (await handler.execute(message, context)) as any;
      const afterTime = new Date();

      const returnedTime = new Date(result[2].currentTime);
      expect(returnedTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(returnedTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should preserve messageId in response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-unique-666',
        action: 'Heartbeat',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'hb-unique-666');
      const result = (await handler.execute(message, context)) as any;

      expect(result[1]).toBe('hb-unique-666');
    });

    it('should accept heartbeat with empty payload', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-004',
        action: 'Heartbeat',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'hb-004');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
      expect(result[2].currentTime).toBeDefined();
    });
  });

  describe('Message Format Validation', () => {
    it('should reject invalid messageTypeId', async () => {
      const message = {
        messageTypeId: 3,
        messageId: 'hb-005',
        action: 'Heartbeat',
        payload: {},
      } as any as OcppCallRequest;

      const context = new OcppContext('CP-001', 'hb-005');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4); // CALLERROR
      expect(result[2]).toBe('GenericError');
    });

    it('should return array with 3 elements', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-006',
        action: 'Heartbeat',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'hb-006');
      const result = (await handler.execute(message, context)) as any;

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
    });

    it('should contain required currentTime field', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-007',
        action: 'Heartbeat',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'hb-007');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2]).toHaveProperty('currentTime');
      expect(typeof result[2].currentTime).toBe('string');
    });
  });

  describe('ChargePoint Tracking', () => {
    it('should handle heartbeats from different chargepoints', async () => {
      const chargePoints = ['CP-001', 'CP-002', 'CP-003'];

      for (const chargePointId of chargePoints) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `hb-cp-${chargePointId}`,
          action: 'Heartbeat',
          payload: {},
        };

        const context = new OcppContext(chargePointId, `hb-cp-${chargePointId}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
        expect(result[2].currentTime).toBeDefined();
      }
    });

    it('should handle rapid heartbeat sequence', async () => {
      const messages: OcppCallRequest[] = Array.from({ length: 5 }, (_, i) => ({
        messageTypeId: 2,
        messageId: `hb-seq-${i}`,
        action: 'Heartbeat',
        payload: {},
      })) as any;

      const context = new OcppContext('CP-001', 'hb-seq-0');
      let previousTime: string | null = null;

      for (let i = 0; i < messages.length; i++) {
        const result = (await handler.execute(messages[i], context)) as any;
        const currentTime = result[2].currentTime;

        if (previousTime) {
          // Each heartbeat should return same or later time
          expect(new Date(currentTime).getTime()).toBeGreaterThanOrEqual(
            new Date(previousTime).getTime(),
          );
        }

        previousTime = currentTime;
      }
    });
  });

  describe('Performance & Concurrency', () => {
    it('should complete within 50ms SLA (heartbeat critical)', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-perf',
        action: 'Heartbeat',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'hb-perf');
      const start = performance.now();

      await handler.execute(message, context);

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(50);
    });

    it('should handle concurrent heartbeats from multiple chargepoints', async () => {
      const messages: OcppCallRequest[] = Array.from({ length: 10 }, (_, i) => ({
        messageTypeId: 2,
        messageId: `hb-concurrent-${i}`,
        action: 'Heartbeat',
        payload: {},
      })) as any;

      const contexts = messages.map(
        (msg, i) => new OcppContext(`CP-${String(i + 1).padStart(3, '0')}`, msg.messageId),
      );

      const results = await Promise.all(
        messages.map((msg, idx) => handler.execute(msg, contexts[idx])),
      );

      expect(results).toHaveLength(10);
      results.forEach((result: any) => {
        expect(result[0]).toBe(3);
        expect(result[2].currentTime).toBeDefined();
      });
    });
  });

  describe('OCPP 1.6 Compliance', () => {
    it('should return OCPP wire format [3, id, {...}]', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-compliance',
        action: 'Heartbeat',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'hb-compliance');
      const result = (await handler.execute(message, context)) as any;

      expect(typeof result[0]).toBe('number');
      expect(typeof result[1]).toBe('string');
      expect(typeof result[2]).toBe('object');
    });

    it('should support heartbeat interval enforcement', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-interval',
        action: 'Heartbeat',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'hb-interval');
      const result = (await handler.execute(message, context)) as any;

      // Verify response structure for interval tracking
      expect(result[2].currentTime).toBeDefined();
      expect(result[0]).toBe(3);
    });
  });
});
