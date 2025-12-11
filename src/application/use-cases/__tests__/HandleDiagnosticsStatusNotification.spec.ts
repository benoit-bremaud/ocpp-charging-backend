import { Test, TestingModule } from '@nestjs/testing';
import { HandleDiagnosticsStatusNotification } from '../HandleDiagnosticsStatusNotification';
import { OcppContext } from '../../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../../dto/OcppProtocol';

describe('HandleDiagnosticsStatusNotification', () => {
  let handler: HandleDiagnosticsStatusNotification;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleDiagnosticsStatusNotification],
    }).compile();

    handler = module.get<HandleDiagnosticsStatusNotification>(
      HandleDiagnosticsStatusNotification,
    );
  });

  describe('Happy Path - Valid DiagnosticsStatusNotification', () => {
    it('should accept DiagnosticsStatusNotification request', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dsn-001',
        action: 'DiagnosticsStatusNotification',
        payload: {
          status: 'Idle',
        },
      };

      const context = new OcppContext('CP-001', 'dsn-001');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3); // CALLRESULT
      expect(result[1]).toBe('dsn-001');
      expect(typeof result[2]).toBe('object');
    });

    it('should accept Uploaded status', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dsn-002',
        action: 'DiagnosticsStatusNotification',
        payload: {
          status: 'Uploaded',
        },
      };

      const context = new OcppContext('CP-001', 'dsn-002');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should accept UploadFailed status', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dsn-003',
        action: 'DiagnosticsStatusNotification',
        payload: {
          status: 'UploadFailed',
        },
      };

      const context = new OcppContext('CP-001', 'dsn-003');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should accept Uploading status', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dsn-004',
        action: 'DiagnosticsStatusNotification',
        payload: {
          status: 'Uploading',
        },
      };

      const context = new OcppContext('CP-001', 'dsn-004');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should preserve messageId in response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dsn-unique-777',
        action: 'DiagnosticsStatusNotification',
        payload: {
          status: 'Idle',
        },
      };

      const context = new OcppContext('CP-001', 'dsn-unique-777');
      const result = (await handler.execute(message, context)) as any;

      expect(result[1]).toBe('dsn-unique-777');
    });
  });

  describe('Message Format Validation', () => {
    it('should reject invalid messageTypeId', async () => {
      const message = {
        messageTypeId: 3,
        messageId: 'dsn-005',
        action: 'DiagnosticsStatusNotification',
        payload: { status: 'Idle' },
      } as any as OcppCallRequest;

      const context = new OcppContext('CP-001', 'dsn-005');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4); // CALLERROR
      expect(result[2]).toBe('GenericError');
    });

    it('should return array with 3 elements', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dsn-006',
        action: 'DiagnosticsStatusNotification',
        payload: {
          status: 'Idle',
        },
      };

      const context = new OcppContext('CP-001', 'dsn-006');
      const result = (await handler.execute(message, context)) as any;

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
    });

    it('should return empty object as response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dsn-007',
        action: 'DiagnosticsStatusNotification',
        payload: {
          status: 'Idle',
        },
      };

      const context = new OcppContext('CP-001', 'dsn-007');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2]).toEqual({});
    });
  });

  describe('Diagnostics Status Handling', () => {
    it('should handle all valid diagnostic statuses', async () => {
      const statuses = ['Idle', 'Uploaded', 'UploadFailed', 'Uploading'];

      for (const status of statuses) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `dsn-status-${status}`,
          action: 'DiagnosticsStatusNotification',
          payload: { status },
        };

        const context = new OcppContext('CP-001', `dsn-status-${status}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
      }
    });

    it('should handle multiple chargepoints', async () => {
      const chargePoints = ['CP-001', 'CP-002', 'CP-003'];

      for (const chargePointId of chargePoints) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `dsn-cp-${chargePointId}`,
          action: 'DiagnosticsStatusNotification',
          payload: { status: 'Idle' },
        };

        const context = new OcppContext(chargePointId, `dsn-cp-${chargePointId}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
      }
    });

    it('should handle status transitions', async () => {
      const statusTransitions = [
        'Idle',
        'Uploading',
        'Uploaded',
        'Idle',
        'Uploading',
        'UploadFailed',
      ];

      const context = new OcppContext('CP-001', 'dsn-transitions');

      for (let i = 0; i < statusTransitions.length; i++) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `dsn-trans-${i}`,
          action: 'DiagnosticsStatusNotification',
          payload: { status: statusTransitions[i] },
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
        messageId: 'dsn-perf',
        action: 'DiagnosticsStatusNotification',
        payload: {
          status: 'Idle',
        },
      };

      const context = new OcppContext('CP-001', 'dsn-perf');
      const start = performance.now();

      await handler.execute(message, context);

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent diagnostics notifications', async () => {
      const messages: OcppCallRequest[] = Array.from({ length: 5 }, (_, i) => ({
        messageTypeId: 2,
        messageId: `dsn-concurrent-${i}`,
        action: 'DiagnosticsStatusNotification',
        payload: {
          status:
            i % 2 === 0 ? 'Uploading' : 'Uploaded',
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
        messageId: 'dsn-compliance',
        action: 'DiagnosticsStatusNotification',
        payload: {
          status: 'Idle',
        },
      };

      const context = new OcppContext('CP-001', 'dsn-compliance');
      const result = (await handler.execute(message, context)) as any;

      expect(typeof result[0]).toBe('number');
      expect(typeof result[1]).toBe('string');
      expect(typeof result[2]).toBe('object');
    });

    it('should support diagnostic file upload lifecycle', async () => {
      const uploadLifecycle = [
        { status: 'Idle', messageId: 'dsn-lc-1' },
        { status: 'Uploading', messageId: 'dsn-lc-2' },
        { status: 'Uploaded', messageId: 'dsn-lc-3' },
      ];

      const context = new OcppContext('CP-001', 'dsn-lifecycle');

      for (const lifecycleStep of uploadLifecycle) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: lifecycleStep.messageId,
          action: 'DiagnosticsStatusNotification',
          payload: { status: lifecycleStep.status },
        };

        const result = (await handler.execute(message, context)) as any;
        expect(result[0]).toBe(3);
        expect(result[2]).toEqual({});
      }
    });
  });
});
