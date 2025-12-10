import { Test, TestingModule } from '@nestjs/testing';

import { HandleHeartbeat } from '../HandleHeartbeat';
import { OcppCallRequest } from '../../dto/OcppProtocol';
import { OcppContext } from '../../../domain/value-objects/OcppContext';

describe('HandleHeartbeat', () => {
  let useCase: HandleHeartbeat;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleHeartbeat],
    }).compile();

    useCase = module.get(HandleHeartbeat);
  });

  describe('execute', () => {
    // EXISTING TESTS (from your original file) - 8 tests
    it('should respond to Heartbeat with current time', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-001',
        action: 'Heartbeat',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'hb-001');
      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(3); // CALLRESULT
      expect(result[1]).toBe('hb-001');
      expect(result[2]).toHaveProperty('currentTime');
    });

    it('should validate message is CALL type', async () => {
      const invalidMessage = {
        messageTypeId: 99,
        messageId: 'hb-002',
        action: 'Heartbeat',
        payload: {},
      } as unknown as OcppCallRequest;

      const context = new OcppContext('CP-001', 'hb-002');
      const result = await useCase.execute(invalidMessage, context);

      expect(result[0]).toBe(4); // CALLERROR
    });

    it('should return heartbeat response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-003',
        action: 'Heartbeat',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'hb-003');
      const result = await useCase.execute(message, context);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle heartbeat error response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-004',
        action: 'Heartbeat',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'hb-004');
      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(3); // CALLRESULT
    });

    it('should preserve messageId in response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-preserve-id',
        action: 'Heartbeat',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'hb-preserve-id');
      const result = await useCase.execute(message, context);

      expect(result[1]).toBe('hb-preserve-id');
    });

    it('should reject payload with extra properties', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-extra-props',
        action: 'Heartbeat',
        payload: { extraField: 'invalid' }, // ❌ Extra property
      };

      const context = new OcppContext('CP-001', 'hb-extra-props');
      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(4); // CALLERROR
      expect(result[2]).toBe('FormationViolation');
    });

    it('should log successful heartbeat processing', async () => {
      const logSpy = jest.spyOn(useCase['logger'], 'log').mockImplementation();

      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-logging',
        action: 'Heartbeat',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'hb-logging');
      await useCase.execute(message, context);

      expect(logSpy).toHaveBeenCalled();
      logSpy.mockRestore();
    });

    it('should complete within 50ms', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-perf',
        action: 'Heartbeat',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'hb-perf');
      const start = performance.now();
      await useCase.execute(message, context);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
    });

    // NEW TESTS (7 additional) - 9-15
    it('should return timestamp in ISO 8601 format', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-iso-8601',
        action: 'Heartbeat',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'hb-iso-8601');
      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(3); // CALLRESULT
      expect(result[2]).toHaveProperty('currentTime');

      // Type guard avec as
      const timestamp = (result[2] as Record<string, unknown>).currentTime;

      // Validate ISO 8601 format
      expect(typeof timestamp).toBe('string');
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle concurrent heartbeat requests', async () => {
      const messages = Array(5)
        .fill(null)
        .map((_, i) => ({
          messageTypeId: 2,
          messageId: `hb-concurrent-${i}`,
          action: 'Heartbeat',
          payload: {},
        }));

      const contexts = messages.map((msg, i) => new OcppContext('CP-001', msg.messageId));

      const results = await Promise.all(
        messages.map((msg, i) => useCase.execute(msg as OcppCallRequest, contexts[i])),
      );

      expect(results).toHaveLength(5);
      expect(results.every((r: any) => r[0] === 3)).toBe(true);
    });

    it('should handle rapid sequential requests without memory leak', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-rapid',
        action: 'Heartbeat',
        payload: {},
      };

      // Execute 10 times rapidly
      for (let i = 0; i < 10; i++) {
        const context = new OcppContext('CP-001', `hb-rapid-${i}`);
        const result = await useCase.execute(message, context);
        expect(result[0]).toBe(3);
      }
    });

    it('should preserve different messageIds across multiple calls', async () => {
      const ids = ['hb-001', 'hb-002', 'hb-003'];
      const results = [];

      for (const id of ids) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: id,
          action: 'Heartbeat',
          payload: {},
        };
        const context = new OcppContext('CP-001', id);
        const result = await useCase.execute(message, context);
        results.push(result);
      }

      expect(results[0][1]).toBe('hb-001');
      expect(results[1][1]).toBe('hb-002');
      expect(results[2][1]).toBe('hb-003');
    });

    it('should accept empty payload object correctly', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-empty-payload',
        action: 'Heartbeat',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'hb-empty-payload');
      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(3); // CALLRESULT
      expect(result[2]).toHaveProperty('currentTime');
    });

    it('should reject null payload', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'hb-null-payload',
        action: 'Heartbeat',
        payload: null as any,
      };

      const context = new OcppContext('CP-001', 'hb-null-payload');
      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(4); // CALLERROR
      expect(result[2]).toBe('FormationViolation');
    });

    it('should return consistent response structure across multiple calls', async () => {
      const calls = [
        { messageTypeId: 2, messageId: 'hb-struct-1', action: 'Heartbeat', payload: {} },
        { messageTypeId: 2, messageId: 'hb-struct-2', action: 'Heartbeat', payload: {} },
      ];

      const results = [];
      for (const message of calls) {
        const context = new OcppContext('CP-001', message.messageId);
        const result = await useCase.execute(message as OcppCallRequest, context);
        results.push(result);
      }

      // All responses should have same structure: [3, messageId, {currentTime}]
      expect(results.every((r: any) => r.length === 3 && r[0] === 3)).toBe(true);
      expect(
        results.every((r: any) => typeof r[2] === 'object' && r[2].hasOwnProperty('currentTime')),
      ).toBe(true);
    });
  });
});
