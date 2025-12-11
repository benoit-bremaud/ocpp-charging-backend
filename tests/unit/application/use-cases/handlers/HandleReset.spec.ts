import { Test, TestingModule } from '@nestjs/testing';
import { HandleReset } from '@/application/use-cases/HandleReset';
import { OcppContext } from '@/domain/value-objects/OcppContext';
import { OcppCallRequest } from '@/application/dto/OcppProtocol';

describe('HandleReset', () => {
  let handler: HandleReset;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleReset],
    }).compile();

    handler = module.get<HandleReset>(HandleReset);
  });

  describe('Happy Path - Valid Reset', () => {
    it('should accept Reset request with Hard type', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rst-001',
        action: 'Reset',
        payload: {
          type: 'Hard',
        },
      };

      const context = new OcppContext('CP-001', 'rst-001');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3); // CALLRESULT
      expect(result[1]).toBe('rst-001');
      expect(result[2].status).toBe('Accepted');
    });

    it('should accept Reset request with Soft type', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rst-002',
        action: 'Reset',
        payload: {
          type: 'Soft',
        },
      };

      const context = new OcppContext('CP-001', 'rst-002');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
      expect(result[2].status).toBe('Accepted');
    });

    it('should accept Reset with empty payload', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rst-003',
        action: 'Reset',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'rst-003');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should preserve messageId in response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rst-unique-666',
        action: 'Reset',
        payload: {
          type: 'Hard',
        },
      };

      const context = new OcppContext('CP-001', 'rst-unique-666');
      const result = (await handler.execute(message, context)) as any;

      expect(result[1]).toBe('rst-unique-666');
    });

    it('should handle multiple reset types', async () => {
      const resetTypes = ['Hard', 'Soft'];

      for (const type of resetTypes) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `rst-type-${type}`,
          action: 'Reset',
          payload: { type },
        };

        const context = new OcppContext('CP-001', `rst-type-${type}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
      }
    });
  });

  describe('Message Format Validation', () => {
    it('should reject invalid messageTypeId', async () => {
      const message = {
        messageTypeId: 3,
        messageId: 'rst-004',
        action: 'Reset',
        payload: { type: 'Hard' },
      } as any as OcppCallRequest;

      const context = new OcppContext('CP-001', 'rst-004');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4); // CALLERROR
      expect(result[2]).toBe('GenericError');
    });

    it('should return array with 3 elements', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rst-005',
        action: 'Reset',
        payload: {
          type: 'Hard',
        },
      };

      const context = new OcppContext('CP-001', 'rst-005');
      const result = (await handler.execute(message, context)) as any;

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
    });

    it('should return Accepted status', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rst-006',
        action: 'Reset',
        payload: {
          type: 'Soft',
        },
      };

      const context = new OcppContext('CP-001', 'rst-006');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].status).toBe('Accepted');
    });
  });

  describe('Reset Type Handling', () => {
    it('should handle Hard reset', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rst-hard',
        action: 'Reset',
        payload: { type: 'Hard' },
      };

      const context = new OcppContext('CP-001', 'rst-hard');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should handle Soft reset', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rst-soft',
        action: 'Reset',
        payload: { type: 'Soft' },
      };

      const context = new OcppContext('CP-001', 'rst-soft');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should handle missing type field', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rst-no-type',
        action: 'Reset',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'rst-no-type');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });
  });

  describe('Performance & Concurrency', () => {
    it('should complete within 100ms SLA', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rst-perf',
        action: 'Reset',
        payload: {
          type: 'Hard',
        },
      };

      const context = new OcppContext('CP-001', 'rst-perf');
      const start = performance.now();

      await handler.execute(message, context);

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent reset requests', async () => {
      const messages: OcppCallRequest[] = Array.from({ length: 5 }, (_, i) => ({
        messageTypeId: 2,
        messageId: `rst-concurrent-${i}`,
        action: 'Reset',
        payload: {
          type: i % 2 === 0 ? 'Hard' : 'Soft',
        },
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

    it('should handle rapid sequential resets', async () => {
      for (let i = 0; i < 10; i++) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `rst-seq-${i}`,
          action: 'Reset',
          payload: { type: i % 2 === 0 ? 'Hard' : 'Soft' },
        };

        const context = new OcppContext('CP-001', `rst-seq-${i}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
      }
    });
  });

  describe('OCPP 1.6 Compliance', () => {
    it('should return OCPP wire format [3, id, {...}]', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rst-compliance',
        action: 'Reset',
        payload: {
          type: 'Hard',
        },
      };

      const context = new OcppContext('CP-001', 'rst-compliance');
      const result = (await handler.execute(message, context)) as any;

      expect(typeof result[0]).toBe('number');
      expect(typeof result[1]).toBe('string');
      expect(typeof result[2]).toBe('object');
    });

    it('should support both Hard and Soft reset types per spec', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rst-types',
        action: 'Reset',
        payload: {
          type: 'Soft',
        },
      };

      const context = new OcppContext('CP-001', 'rst-types');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
      expect(result[2].status).toBe('Accepted');
    });
  });
});
