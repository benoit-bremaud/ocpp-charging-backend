import { Test, TestingModule } from '@nestjs/testing';
import { HandleFirmwareStatusNotification } from '@/application/use-cases/HandleFirmwareStatusNotification';
import { OcppContext } from '@/domain/value-objects/OcppContext';
import { OcppCallRequest } from '@/application/dto/OcppProtocol';

describe('HandleFirmwareStatusNotification', () => {
  let handler: HandleFirmwareStatusNotification;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleFirmwareStatusNotification],
    }).compile();

    handler = module.get<HandleFirmwareStatusNotification>(
      HandleFirmwareStatusNotification,
    );
  });

  describe('Happy Path - Valid FirmwareStatusNotification', () => {
    it('should accept FirmwareStatusNotification request', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'fsn-001',
        action: 'FirmwareStatusNotification',
        payload: {
          status: 'Downloaded',
          requestId: 1,
        },
      };

      const context = new OcppContext('CP-001', 'fsn-001');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3); // CALLRESULT
      expect(result[1]).toBe('fsn-001');
      expect(typeof result[2]).toBe('object');
    });

    it('should accept Downloading status', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'fsn-002',
        action: 'FirmwareStatusNotification',
        payload: {
          status: 'Downloading',
          requestId: 2,
        },
      };

      const context = new OcppContext('CP-001', 'fsn-002');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should accept DownloadFailed status', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'fsn-003',
        action: 'FirmwareStatusNotification',
        payload: {
          status: 'DownloadFailed',
          requestId: 3,
        },
      };

      const context = new OcppContext('CP-001', 'fsn-003');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should accept DownloadScheduled status', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'fsn-004',
        action: 'FirmwareStatusNotification',
        payload: {
          status: 'DownloadScheduled',
          requestId: 4,
        },
      };

      const context = new OcppContext('CP-001', 'fsn-004');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should preserve messageId in response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'fsn-unique-888',
        action: 'FirmwareStatusNotification',
        payload: {
          status: 'Downloaded',
          requestId: 5,
        },
      };

      const context = new OcppContext('CP-001', 'fsn-unique-888');
      const result = (await handler.execute(message, context)) as any;

      expect(result[1]).toBe('fsn-unique-888');
    });
  });

  describe('Message Format Validation', () => {
    it('should reject invalid messageTypeId', async () => {
      const message = {
        messageTypeId: 3,
        messageId: 'fsn-005',
        action: 'FirmwareStatusNotification',
        payload: { status: 'Downloaded', requestId: 6 },
      } as any as OcppCallRequest;

      const context = new OcppContext('CP-001', 'fsn-005');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4); // CALLERROR
      expect(result[2]).toBe('GenericError');
    });

    it('should return array with 3 elements', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'fsn-006',
        action: 'FirmwareStatusNotification',
        payload: {
          status: 'Downloaded',
          requestId: 7,
        },
      };

      const context = new OcppContext('CP-001', 'fsn-006');
      const result = (await handler.execute(message, context)) as any;

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
    });

    it('should return empty object as response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'fsn-007',
        action: 'FirmwareStatusNotification',
        payload: {
          status: 'Downloaded',
          requestId: 8,
        },
      };

      const context = new OcppContext('CP-001', 'fsn-007');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2]).toEqual({});
    });
  });

  describe('Firmware Status Handling', () => {
    it('should handle all valid firmware statuses', async () => {
      const statuses = [
        'Downloaded',
        'DownloadFailed',
        'Downloading',
        'DownloadScheduled',
        'DownloadPaused',
        'Installed',
        'InstallationFailed',
        'Installing',
      ];

      for (const status of statuses) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `fsn-status-${status}`,
          action: 'FirmwareStatusNotification',
          payload: { status, requestId: 10 },
        };

        const context = new OcppContext('CP-001', `fsn-status-${status}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
      }
    });

    it('should handle different requestIds', async () => {
      const requestIds = [0, 1, 100, 999999, 2147483647];

      for (const requestId of requestIds) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `fsn-req-${requestId}`,
          action: 'FirmwareStatusNotification',
          payload: { status: 'Downloaded', requestId },
        };

        const context = new OcppContext('CP-001', `fsn-req-${requestId}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
      }
    });

    it('should handle firmware lifecycle', async () => {
      const lifecycle = [
        'DownloadScheduled',
        'Downloading',
        'Downloaded',
        'Installing',
        'Installed',
      ];

      const context = new OcppContext('CP-001', 'fsn-lifecycle');

      for (let i = 0; i < lifecycle.length; i++) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `fsn-lc-${i}`,
          action: 'FirmwareStatusNotification',
          payload: { status: lifecycle[i], requestId: 20 },
        };

        const result = (await handler.execute(message, context)) as any;
        expect(result[0]).toBe(3);
      }
    });
  });

  describe('Performance & Concurrency', () => {
    it('should complete within 100ms SLA', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'fsn-perf',
        action: 'FirmwareStatusNotification',
        payload: {
          status: 'Downloaded',
          requestId: 30,
        },
      };

      const context = new OcppContext('CP-001', 'fsn-perf');
      const start = performance.now();

      await handler.execute(message, context);

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent firmware notifications', async () => {
      const messages: OcppCallRequest[] = Array.from({ length: 5 }, (_, i) => ({
        messageTypeId: 2,
        messageId: `fsn-concurrent-${i}`,
        action: 'FirmwareStatusNotification',
        payload: {
          status: i % 2 === 0 ? 'Downloading' : 'Downloaded',
          requestId: 40 + i,
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
        messageId: 'fsn-compliance',
        action: 'FirmwareStatusNotification',
        payload: {
          status: 'Downloaded',
          requestId: 50,
        },
      };

      const context = new OcppContext('CP-001', 'fsn-compliance');
      const result = (await handler.execute(message, context)) as any;

      expect(typeof result[0]).toBe('number');
      expect(typeof result[1]).toBe('string');
      expect(typeof result[2]).toBe('object');
    });

    it('should support firmware update lifecycle', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'fsn-update',
        action: 'FirmwareStatusNotification',
        payload: {
          status: 'Installing',
          requestId: 60,
        },
      };

      const context = new OcppContext('CP-001', 'fsn-update');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
      expect(result[2]).toEqual({});
    });
  });
});
