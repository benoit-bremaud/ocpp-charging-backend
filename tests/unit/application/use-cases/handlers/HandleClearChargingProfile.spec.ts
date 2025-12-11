import { Test, TestingModule } from '@nestjs/testing';
import { HandleClearChargingProfile } from '@/application/use-cases/HandleClearChargingProfile';
import { OcppContext } from '@/domain/value-objects/OcppContext';
import { OcppCallRequest } from '@/application/dto/OcppProtocol';

describe('HandleClearChargingProfile', () => {
  let handler: HandleClearChargingProfile;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleClearChargingProfile],
    }).compile();

    handler = module.get<HandleClearChargingProfile>(HandleClearChargingProfile);
  });

  describe('Happy Path - Valid ClearChargingProfile', () => {
    it('should accept ClearChargingProfile request', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'ccp-001',
        action: 'ClearChargingProfile',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'ccp-001');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3); // CALLRESULT
      expect(result[1]).toBe('ccp-001');
      expect(result[2].status).toBe('Accepted');
    });

    it('should accept with connectorId specified', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'ccp-002',
        action: 'ClearChargingProfile',
        payload: { connectorId: 1 },
      };

      const context = new OcppContext('CP-001', 'ccp-002');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
      expect(result[2].status).toBe('Accepted');
    });

    it('should accept with connectorId 0 (all connectors)', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'ccp-003',
        action: 'ClearChargingProfile',
        payload: { connectorId: 0 },
      };

      const context = new OcppContext('CP-001', 'ccp-003');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
      expect(result[2].status).toBe('Accepted');
    });

    it('should preserve messageId in response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'ccp-unique-456',
        action: 'ClearChargingProfile',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'ccp-unique-456');
      const result = (await handler.execute(message, context)) as any;

      expect(result[1]).toBe('ccp-unique-456');
    });
  });

  describe('Message Format Validation', () => {
    it('should reject invalid messageTypeId', async () => {
      const message = {
        messageTypeId: 3,
        messageId: 'ccp-004',
        action: 'ClearChargingProfile',
        payload: {},
      } as any as OcppCallRequest;

      const context = new OcppContext('CP-001', 'ccp-004');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4); // CALLERROR
      expect(result[2]).toBe('GenericError');
    });

    it('should return array with 3 elements', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'ccp-005',
        action: 'ClearChargingProfile',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'ccp-005');
      const result = (await handler.execute(message, context)) as any;

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
    });
  });

  describe('Connector ID Handling', () => {
    it('should handle missing connectorId (defaults to all)', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'ccp-006',
        action: 'ClearChargingProfile',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'ccp-006');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should handle multiple connector IDs in sequence', async () => {
      const connectorIds = [1, 2, 3, 4];

      for (const connectorId of connectorIds) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `ccp-connector-${connectorId}`,
          action: 'ClearChargingProfile',
          payload: { connectorId },
        };

        const context = new OcppContext('CP-001', `ccp-connector-${connectorId}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
      }
    });
  });

  describe('Performance & Concurrency', () => {
    it('should complete within 100ms SLA', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'ccp-perf',
        action: 'ClearChargingProfile',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'ccp-perf');
      const start = performance.now();

      await handler.execute(message, context);

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent requests', async () => {
      const messages: OcppCallRequest[] = Array.from({ length: 5 }, (_, i) => ({
        messageTypeId: 2,
        messageId: `ccp-concurrent-${i}`,
        action: 'ClearChargingProfile',
        payload: { connectorId: i + 1 },
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
  });

  describe('OCPP 1.6 Compliance', () => {
    it('should return OCPP wire format [3, id, {...}]', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'ccp-compliance',
        action: 'ClearChargingProfile',
        payload: {},
      };

      const context = new OcppContext('CP-001', 'ccp-compliance');
      const result = (await handler.execute(message, context)) as any;

      expect(typeof result[0]).toBe('number');
      expect(typeof result[1]).toBe('string');
      expect(typeof result[2]).toBe('object');
    });

    it('should always return Accepted status', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'ccp-status',
        action: 'ClearChargingProfile',
        payload: { connectorId: 1 },
      };

      const context = new OcppContext('CP-001', 'ccp-status');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].status).toBe('Accepted');
    });
  });
});
