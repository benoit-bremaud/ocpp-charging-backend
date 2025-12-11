import { Test, TestingModule } from '@nestjs/testing';
import { HandleGetCompositeSchedule } from '../HandleGetCompositeSchedule';
import { OcppContext } from '../../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../../dto/OcppProtocol';

describe('HandleGetCompositeSchedule', () => {
  let handler: HandleGetCompositeSchedule;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleGetCompositeSchedule],
    }).compile();

    handler = module.get<HandleGetCompositeSchedule>(HandleGetCompositeSchedule);
  });

  describe('Happy Path', () => {
    it('should accept GetCompositeSchedule request', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'gcs-001',
        action: 'GetCompositeSchedule',
        payload: {
          connectorId: 1,
          duration: 3600,
          chargingRateUnit: 'W',
        },
      };

      const context = new OcppContext('CP-001', 'gcs-001');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
      expect(result[1]).toBe('gcs-001');
      expect(result[2].status).toBe('Accepted');
    });

    it('should return schedule start timestamp', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'gcs-002',
        action: 'GetCompositeSchedule',
        payload: { connectorId: 1, duration: 3600 },
      };

      const context = new OcppContext('CP-001', 'gcs-002');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].scheduleStart).toBeDefined();
      expect(typeof result[2].scheduleStart).toBe('string');
    });

    it('should return empty charging schedule period', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'gcs-003',
        action: 'GetCompositeSchedule',
        payload: { connectorId: 1 },
      };

      const context = new OcppContext('CP-001', 'gcs-003');
      const result = (await handler.execute(message, context)) as any;

      expect(Array.isArray(result[2].chargingSchedulePeriod)).toBe(true);
    });

    it('should preserve messageId', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'gcs-unique-111',
        action: 'GetCompositeSchedule',
        payload: { connectorId: 1 },
      };

      const context = new OcppContext('CP-001', 'gcs-unique-111');
      const result = (await handler.execute(message, context)) as any;

      expect(result[1]).toBe('gcs-unique-111');
    });

    it('should handle various connector IDs', async () => {
      for (const connectorId of [0, 1, 2, 3]) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `gcs-conn-${connectorId}`,
          action: 'GetCompositeSchedule',
          payload: { connectorId },
        };

        const context = new OcppContext('CP-001', `gcs-conn-${connectorId}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
      }
    });
  });

  describe('Message Validation', () => {
    it('should reject invalid messageTypeId', async () => {
      const message = {
        messageTypeId: 3,
        messageId: 'gcs-004',
        action: 'GetCompositeSchedule',
        payload: { connectorId: 1 },
      } as any as OcppCallRequest;

      const context = new OcppContext('CP-001', 'gcs-004');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4);
    });

    it('should return array with 3 elements', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'gcs-005',
        action: 'GetCompositeSchedule',
        payload: { connectorId: 1 },
      };

      const context = new OcppContext('CP-001', 'gcs-005');
      const result = (await handler.execute(message, context)) as any;

      expect(result).toHaveLength(3);
    });
  });

  describe('Duration Handling', () => {
    it('should handle various duration values', async () => {
      for (const duration of [60, 3600, 86400]) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `gcs-dur-${duration}`,
          action: 'GetCompositeSchedule',
          payload: { connectorId: 1, duration },
        };

        const context = new OcppContext('CP-001', `gcs-dur-${duration}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
      }
    });

    it('should handle charging rate units', async () => {
      for (const unit of ['W', 'A']) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `gcs-unit-${unit}`,
          action: 'GetCompositeSchedule',
          payload: { connectorId: 1, chargingRateUnit: unit },
        };

        const context = new OcppContext('CP-001', `gcs-unit-${unit}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
      }
    });
  });

  describe('Performance', () => {
    it('should complete within 100ms', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'gcs-perf',
        action: 'GetCompositeSchedule',
        payload: { connectorId: 1 },
      };

      const context = new OcppContext('CP-001', 'gcs-perf');
      const start = performance.now();

      await handler.execute(message, context);

      expect(performance.now() - start).toBeLessThan(100);
    });

    it('should handle concurrent requests', async () => {
      const messages: OcppCallRequest[] = Array.from({ length: 5 }, (_, i) => ({
        messageTypeId: 2,
        messageId: `gcs-concurrent-${i}`,
        action: 'GetCompositeSchedule',
        payload: { connectorId: (i % 3) + 1 },
      })) as any;

      const contexts = messages.map(
        (msg: OcppCallRequest) => new OcppContext('CP-001', msg.messageId),
      );

      const results = await Promise.all(
        messages.map((msg: OcppCallRequest, idx: number) =>
          handler.execute(msg, contexts[idx]),
        ),
      );

      expect(results).toHaveLength(5);
    });
  });

  describe('OCPP 1.6 Compliance', () => {
    it('should return OCPP wire format', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'gcs-compliance',
        action: 'GetCompositeSchedule',
        payload: { connectorId: 1 },
      };

      const context = new OcppContext('CP-001', 'gcs-compliance');
      const result = (await handler.execute(message, context)) as any;

      expect(typeof result[0]).toBe('number');
      expect(typeof result[1]).toBe('string');
      expect(typeof result[2]).toBe('object');
    });

    it('should have Accepted status', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'gcs-status',
        action: 'GetCompositeSchedule',
        payload: { connectorId: 1 },
      };

      const context = new OcppContext('CP-001', 'gcs-status');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].status).toBe('Accepted');
    });
  });
});
