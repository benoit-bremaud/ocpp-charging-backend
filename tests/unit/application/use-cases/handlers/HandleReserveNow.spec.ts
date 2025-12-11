import { Test, TestingModule } from '@nestjs/testing';
import { HandleReserveNow } from '@/application/use-cases/HandleReserveNow';
import { OcppContext } from '@/domain/value-objects/OcppContext';
import { OcppCallRequest } from '@/application/dto/OcppProtocol';

describe('HandleReserveNow', () => {
  let handler: HandleReserveNow;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleReserveNow],
    }).compile();

    handler = module.get<HandleReserveNow>(HandleReserveNow);
  });

  describe('Happy Path - Valid ReserveNow', () => {
    it('should accept ReserveNow request', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rn-001',
        action: 'ReserveNow',
        payload: {
          connectorId: 1,
          expiryDate: new Date().toISOString(),
          idTag: 'TAG-123',
          reservationId: 100,
        },
      };

      const context = new OcppContext('CP-001', 'rn-001');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3); // CALLRESULT
      expect(result[1]).toBe('rn-001');
      expect(result[2].status).toBe('Accepted');
    });

    it('should accept reservation for connector 0', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rn-002',
        action: 'ReserveNow',
        payload: {
          connectorId: 0,
          expiryDate: new Date().toISOString(),
          idTag: 'TAG-456',
          reservationId: 101,
        },
      };

      const context = new OcppContext('CP-001', 'rn-002');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should accept reservation with future expiryDate', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rn-003',
        action: 'ReserveNow',
        payload: {
          connectorId: 1,
          expiryDate: futureDate.toISOString(),
          idTag: 'TAG-789',
          reservationId: 102,
        },
      };

      const context = new OcppContext('CP-001', 'rn-003');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should accept reservation with different reservation IDs', async () => {
      const reservationIds = [1, 100, 999999];

      for (const reservationId of reservationIds) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `rn-resid-${reservationId}`,
          action: 'ReserveNow',
          payload: {
            connectorId: 1,
            expiryDate: new Date().toISOString(),
            idTag: 'TAG-TEST',
            reservationId,
          },
        };

        const context = new OcppContext('CP-001', `rn-resid-${reservationId}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
      }
    });

    it('should preserve messageId in response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rn-unique-555',
        action: 'ReserveNow',
        payload: {
          connectorId: 1,
          expiryDate: new Date().toISOString(),
          idTag: 'TAG-UNIQUE',
          reservationId: 200,
        },
      };

      const context = new OcppContext('CP-001', 'rn-unique-555');
      const result = (await handler.execute(message, context)) as any;

      expect(result[1]).toBe('rn-unique-555');
    });
  });

  describe('Message Format Validation', () => {
    it('should reject invalid messageTypeId', async () => {
      const message = {
        messageTypeId: 3,
        messageId: 'rn-004',
        action: 'ReserveNow',
        payload: {
          connectorId: 1,
          expiryDate: new Date().toISOString(),
          idTag: 'TAG',
          reservationId: 300,
        },
      } as any as OcppCallRequest;

      const context = new OcppContext('CP-001', 'rn-004');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4); // CALLERROR
      expect(result[2]).toBe('GenericError');
    });

    it('should return array with 3 elements', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rn-005',
        action: 'ReserveNow',
        payload: {
          connectorId: 1,
          expiryDate: new Date().toISOString(),
          idTag: 'TAG',
          reservationId: 301,
        },
      };

      const context = new OcppContext('CP-001', 'rn-005');
      const result = (await handler.execute(message, context)) as any;

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
    });

    it('should return Accepted status', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rn-006',
        action: 'ReserveNow',
        payload: {
          connectorId: 1,
          expiryDate: new Date().toISOString(),
          idTag: 'TAG',
          reservationId: 302,
        },
      };

      const context = new OcppContext('CP-001', 'rn-006');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].status).toBe('Accepted');
    });
  });

  describe('Connector & Reservation Handling', () => {
    it('should handle multiple connector IDs', async () => {
      const connectorIds = [0, 1, 2, 3, 4, 5];

      for (const connectorId of connectorIds) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `rn-conn-${connectorId}`,
          action: 'ReserveNow',
          payload: {
            connectorId,
            expiryDate: new Date().toISOString(),
            idTag: 'TAG-MULTI',
            reservationId: 400 + connectorId,
          },
        };

        const context = new OcppContext('CP-001', `rn-conn-${connectorId}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
      }
    });

    it('should handle ISO 8601 timestamp format', async () => {
      const isoDate = new Date().toISOString();

      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rn-iso-date',
        action: 'ReserveNow',
        payload: {
          connectorId: 1,
          expiryDate: isoDate,
          idTag: 'TAG-ISO',
          reservationId: 500,
        },
      };

      const context = new OcppContext('CP-001', 'rn-iso-date');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should handle various idTag formats', async () => {
      const idTags = ['TAG-123', '123456', 'RFID-ABC', 'card-uuid'];

      for (const idTag of idTags) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `rn-tag-${idTag}`,
          action: 'ReserveNow',
          payload: {
            connectorId: 1,
            expiryDate: new Date().toISOString(),
            idTag,
            reservationId: 600,
          },
        };

        const context = new OcppContext('CP-001', `rn-tag-${idTag}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
      }
    });
  });

  describe('Performance & Concurrency', () => {
    it('should complete within 100ms SLA', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rn-perf',
        action: 'ReserveNow',
        payload: {
          connectorId: 1,
          expiryDate: new Date().toISOString(),
          idTag: 'TAG-PERF',
          reservationId: 700,
        },
      };

      const context = new OcppContext('CP-001', 'rn-perf');
      const start = performance.now();

      await handler.execute(message, context);

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent reservations', async () => {
      const messages: OcppCallRequest[] = Array.from({ length: 5 }, (_, i) => ({
        messageTypeId: 2,
        messageId: `rn-concurrent-${i}`,
        action: 'ReserveNow',
        payload: {
          connectorId: (i % 3) + 1,
          expiryDate: new Date().toISOString(),
          idTag: `TAG-${i}`,
          reservationId: 800 + i,
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
  });

  describe('OCPP 1.6 Compliance', () => {
    it('should return OCPP wire format [3, id, {...}]', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rn-compliance',
        action: 'ReserveNow',
        payload: {
          connectorId: 1,
          expiryDate: new Date().toISOString(),
          idTag: 'TAG-COMP',
          reservationId: 900,
        },
      };

      const context = new OcppContext('CP-001', 'rn-compliance');
      const result = (await handler.execute(message, context)) as any;

      expect(typeof result[0]).toBe('number');
      expect(typeof result[1]).toBe('string');
      expect(typeof result[2]).toBe('object');
    });

    it('should support reservation with all parameters', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'rn-full',
        action: 'ReserveNow',
        payload: {
          connectorId: 2,
          expiryDate: new Date().toISOString(),
          idTag: 'TAG-FULL',
          reservationId: 1000,
        },
      };

      const context = new OcppContext('CP-001', 'rn-full');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
      expect(result[2].status).toBe('Accepted');
    });
  });
});
