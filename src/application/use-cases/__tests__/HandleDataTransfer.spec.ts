import { Test, TestingModule } from '@nestjs/testing';
import { HandleDataTransfer } from '../HandleDataTransfer';
import { OcppContext } from '../../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../../dto/OcppProtocol';

describe('HandleDataTransfer', () => {
  let handler: HandleDataTransfer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleDataTransfer],
    }).compile();

    handler = module.get<HandleDataTransfer>(HandleDataTransfer);
  });

  describe('Happy Path - Valid DataTransfer', () => {
    it('should accept DataTransfer request with vendorId', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-001',
        action: 'DataTransfer',
        payload: {
          vendorId: 'com.example.vendor',
          messageId: 'msg-123',
          data: 'some-binary-data',
        },
      };

      const context = new OcppContext('CP-001', 'dt-001');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3); // CALLRESULT
      expect(result[1]).toBe('dt-001');
      expect(result[2].status).toBe('Accepted');
    });

    it('should accept DataTransfer with minimal payload', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-002',
        action: 'DataTransfer',
        payload: {
          vendorId: 'vendor.example',
        },
      };

      const context = new OcppContext('CP-001', 'dt-002');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
      expect(result[2].status).toBe('Accepted');
    });

    it('should accept DataTransfer with messageId only', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-003',
        action: 'DataTransfer',
        payload: {
          messageId: 'custom-msg-id',
        },
      };

      const context = new OcppContext('CP-001', 'dt-003');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should accept DataTransfer with binary data', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-004',
        action: 'DataTransfer',
        payload: {
          vendorId: 'vendor.binary',
          data: Buffer.from('binary-data').toString('base64'),
        },
      };

      const context = new OcppContext('CP-001', 'dt-004');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should preserve messageId in response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-unique-999',
        action: 'DataTransfer',
        payload: {
          vendorId: 'test.vendor',
        },
      };

      const context = new OcppContext('CP-001', 'dt-unique-999');
      const result = (await handler.execute(message, context)) as any;

      expect(result[1]).toBe('dt-unique-999');
    });
  });

  describe('Message Format Validation', () => {
    it('should reject invalid messageTypeId', async () => {
      const message = {
        messageTypeId: 3,
        messageId: 'dt-005',
        action: 'DataTransfer',
        payload: { vendorId: 'vendor' },
      } as any as OcppCallRequest;

      const context = new OcppContext('CP-001', 'dt-005');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4); // CALLERROR
      expect(result[2]).toBe('GenericError');
    });

    it('should return array with 3 elements', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-006',
        action: 'DataTransfer',
        payload: {
          vendorId: 'vendor',
        },
      };

      const context = new OcppContext('CP-001', 'dt-006');
      const result = (await handler.execute(message, context)) as any;

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
    });

    it('should return Accepted status', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-007',
        action: 'DataTransfer',
        payload: {
          vendorId: 'vendor',
        },
      };

      const context = new OcppContext('CP-001', 'dt-007');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].status).toBe('Accepted');
    });
  });

  describe('Vendor Data Handling', () => {
    it('should handle various vendor ID formats', async () => {
      const vendorIds = [
        'simple-vendor',
        'com.example.vendor',
        'org.example.vendor.subtype',
        'vendor123',
        'VENDOR_ALL_CAPS',
      ];

      for (const vendorId of vendorIds) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `dt-vendor-${vendorId}`,
          action: 'DataTransfer',
          payload: { vendorId },
        };

        const context = new OcppContext('CP-001', `dt-vendor-${vendorId}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
      }
    });

    it('should handle large data payloads', async () => {
      const largeData = 'x'.repeat(10000); // 10KB of data

      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-large',
        action: 'DataTransfer',
        payload: {
          vendorId: 'vendor.large',
          data: largeData,
        },
      };

      const context = new OcppContext('CP-001', 'dt-large');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should handle special characters in data', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-special',
        action: 'DataTransfer',
        payload: {
          vendorId: 'vendor.special',
          data: '{"key": "value", "special": "chars!@#$%^&*()"}',
        },
      };

      const context = new OcppContext('CP-001', 'dt-special');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });
  });

  describe('Performance & Concurrency', () => {
    it('should complete within 100ms SLA', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-perf',
        action: 'DataTransfer',
        payload: {
          vendorId: 'vendor.perf',
        },
      };

      const context = new OcppContext('CP-001', 'dt-perf');
      const start = performance.now();

      await handler.execute(message, context);

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent data transfers', async () => {
      const messages: OcppCallRequest[] = Array.from({ length: 5 }, (_, i) => ({
        messageTypeId: 2,
        messageId: `dt-concurrent-${i}`,
        action: 'DataTransfer',
        payload: {
          vendorId: `vendor-${i}`,
          messageId: `msg-${i}`,
          data: `data-${i}`,
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
        messageId: 'dt-compliance',
        action: 'DataTransfer',
        payload: {
          vendorId: 'vendor.compliance',
        },
      };

      const context = new OcppContext('CP-001', 'dt-compliance');
      const result = (await handler.execute(message, context)) as any;

      expect(typeof result[0]).toBe('number');
      expect(typeof result[1]).toBe('string');
      expect(typeof result[2]).toBe('object');
    });

    it('should support vendor-specific message exchange', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'dt-vendor-exchange',
        action: 'DataTransfer',
        payload: {
          vendorId: 'vendor.exchange',
          messageId: 'vendor-msg-123',
          data: 'vendor-specific-data',
        },
      };

      const context = new OcppContext('CP-001', 'dt-vendor-exchange');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
      expect(result[2].status).toBe('Accepted');
    });
  });
});
