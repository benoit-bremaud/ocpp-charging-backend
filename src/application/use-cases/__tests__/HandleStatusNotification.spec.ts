import { Test, TestingModule } from '@nestjs/testing';
import { HandleStatusNotification } from '../HandleStatusNotification';
import { OcppContext } from '../../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../../dto/OcppProtocol';

describe('HandleStatusNotification', () => {
  let handler: HandleStatusNotification;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleStatusNotification],
    }).compile();

    handler = module.get<HandleStatusNotification>(HandleStatusNotification);
  });

  describe('Happy Path - Valid StatusNotification', () => {
    it('should accept StatusNotification request', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-001',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          status: 'Available',
          errorCode: 'NoError',
          timestamp: '2025-12-11T17:15:00Z',
        },
      };

      const context = new OcppContext('CP-001', 'sn-001');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3); // CALLRESULT
      expect(result[1]).toBe('sn-001');
      expect(typeof result[2]).toBe('object');
    });

    it('should accept with Charging status', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-002',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          status: 'Charging',
          errorCode: 'NoError',
          timestamp: '2025-12-11T17:16:00Z',
        },
      };

      const context = new OcppContext('CP-001', 'sn-002');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should accept with Unavailable status', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-003',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          status: 'Unavailable',
          errorCode: 'PowerMeterFailure',
          timestamp: '2025-12-11T17:17:00Z',
        },
      };

      const context = new OcppContext('CP-001', 'sn-003');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should accept with vendor error code', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-004',
        action: 'StatusNotification',
        payload: {
          connectorId: 2,
          status: 'Unavailable',
          errorCode: 'CommunicationError',
          timestamp: '2025-12-11T17:18:00Z',
          vendorId: 'vendor123',
          vendorErrorCode: 'COMM_TIMEOUT',
        },
      };

      const context = new OcppContext('CP-001', 'sn-004');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should preserve messageId in response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-unique-555',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          status: 'Available',
          errorCode: 'NoError',
        },
      };

      const context = new OcppContext('CP-001', 'sn-unique-555');
      const result = (await handler.execute(message, context)) as any;

      expect(result[1]).toBe('sn-unique-555');
    });
  });

  describe('Message Format Validation', () => {
    it('should reject invalid messageTypeId', async () => {
      const message = {
        messageTypeId: 3,
        messageId: 'sn-005',
        action: 'StatusNotification',
        payload: { connectorId: 1, status: 'Available', errorCode: 'NoError' },
      } as any as OcppCallRequest;

      const context = new OcppContext('CP-001', 'sn-005');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4); // CALLERROR
      expect(result[2]).toBe('GenericError');
    });

    it('should return array with 3 elements', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-006',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          status: 'Available',
          errorCode: 'NoError',
        },
      };

      const context = new OcppContext('CP-001', 'sn-006');
      const result = (await handler.execute(message, context)) as any;

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
    });
  });

  describe('Status & Connector Handling', () => {
    it('should handle all valid connector IDs', async () => {
      const connectorIds = [0, 1, 2, 3, 4, 5];

      for (const connectorId of connectorIds) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `sn-conn-${connectorId}`,
          action: 'StatusNotification',
          payload: {
            connectorId,
            status: 'Available',
            errorCode: 'NoError',
          },
        };

        const context = new OcppContext('CP-001', `sn-conn-${connectorId}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
      }
    });

    it('should handle all valid status values', async () => {
      const statuses = ['Available', 'Preparing', 'Charging', 'SuspendedEV', 'SuspendedEVSE', 'Finishing', 'Reserved', 'Unavailable', 'Faulted'];

      for (const status of statuses) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `sn-status-${status}`,
          action: 'StatusNotification',
          payload: {
            connectorId: 1,
            status,
            errorCode: 'NoError',
          },
        };

        const context = new OcppContext('CP-001', `sn-status-${status}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
      }
    });
  });

  describe('Performance & Concurrency', () => {
    it('should complete within 100ms SLA', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-perf',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          status: 'Available',
          errorCode: 'NoError',
        },
      };

      const context = new OcppContext('CP-001', 'sn-perf');
      const start = performance.now();

      await handler.execute(message, context);

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent status notifications', async () => {
      const messages: OcppCallRequest[] = Array.from({ length: 5 }, (_, i) => ({
        messageTypeId: 2,
        messageId: `sn-concurrent-${i}`,
        action: 'StatusNotification',
        payload: {
          connectorId: (i % 3) + 1,
          status: i % 2 === 0 ? 'Available' : 'Charging',
          errorCode: 'NoError',
          timestamp: '2025-12-11T17:19:00Z',
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
        messageId: 'sn-compliance',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          status: 'Available',
          errorCode: 'NoError',
        },
      };

      const context = new OcppContext('CP-001', 'sn-compliance');
      const result = (await handler.execute(message, context)) as any;

      expect(typeof result[0]).toBe('number');
      expect(typeof result[1]).toBe('string');
      expect(typeof result[2]).toBe('object');
    });

    it('should return empty object as response body', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-empty',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          status: 'Charging',
          errorCode: 'NoError',
          timestamp: '2025-12-11T17:20:00Z',
        },
      };

      const context = new OcppContext('CP-001', 'sn-empty');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2]).toEqual({});
    });
  });
});
