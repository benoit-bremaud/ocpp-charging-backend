import { Test, TestingModule } from '@nestjs/testing';
import { HandleMeterValues } from '@/application/use-cases/HandleMeterValues';
import { OcppContext } from '@/domain/value-objects/OcppContext';
import { OcppCallRequest } from '@/application/dto/OcppProtocol';

describe('HandleMeterValues', () => {
  let handler: HandleMeterValues;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleMeterValues],
    }).compile();

    handler = module.get<HandleMeterValues>(HandleMeterValues);
  });

  describe('Happy Path - Valid MeterValues', () => {
    it('should accept MeterValues request with single value', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'mv-001',
        action: 'MeterValues',
        payload: {
          connectorId: 1,
          transactionId: 12345,
          meterValue: [
            {
              timestamp: '2025-12-11T17:14:00Z',
              sampledValue: [
                {
                  value: '1000',
                  measurand: 'Energy.Active.Import.Register',
                  unit: 'Wh',
                },
              ],
            },
          ],
        },
      };

      const context = new OcppContext('CP-001', 'mv-001');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3); // CALLRESULT
      expect(result[1]).toBe('mv-001');
      expect(typeof result[2]).toBe('object');
    });

    it('should accept multiple meter value entries', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'mv-002',
        action: 'MeterValues',
        payload: {
          connectorId: 1,
          transactionId: 12345,
          meterValue: [
            {
              timestamp: '2025-12-11T17:14:00Z',
              sampledValue: [
                { value: '1000', measurand: 'Energy.Active.Import.Register' },
              ],
            },
            {
              timestamp: '2025-12-11T17:15:00Z',
              sampledValue: [
                { value: '1100', measurand: 'Energy.Active.Import.Register' },
              ],
            },
          ],
        },
      };

      const context = new OcppContext('CP-001', 'mv-002');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should accept multiple sampled values per entry', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'mv-003',
        action: 'MeterValues',
        payload: {
          connectorId: 2,
          transactionId: 67890,
          meterValue: [
            {
              timestamp: '2025-12-11T17:16:00Z',
              sampledValue: [
                {
                  value: '2500',
                  measurand: 'Energy.Active.Import.Register',
                },
                { value: '230', measurand: 'Voltage' },
                { value: '10.5', measurand: 'Current.Import' },
              ],
            },
          ],
        },
      };

      const context = new OcppContext('CP-001', 'mv-003');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    });

    it('should preserve messageId in response', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'mv-unique-444',
        action: 'MeterValues',
        payload: {
          connectorId: 1,
          meterValue: [
            {
              timestamp: '2025-12-11T17:17:00Z',
              sampledValue: [{ value: '5000' }],
            },
          ],
        },
      };

      const context = new OcppContext('CP-001', 'mv-unique-444');
      const result = (await handler.execute(message, context)) as any;

      expect(result[1]).toBe('mv-unique-444');
    });
  });

  describe('Message Format Validation', () => {
    it('should reject invalid messageTypeId', async () => {
      const message = {
        messageTypeId: 3,
        messageId: 'mv-004',
        action: 'MeterValues',
        payload: { connectorId: 1, meterValue: [] },
      } as any as OcppCallRequest;

      const context = new OcppContext('CP-001', 'mv-004');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4); // CALLERROR
      expect(result[2]).toBe('GenericError');
    });

    it('should return array with 3 elements', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'mv-005',
        action: 'MeterValues',
        payload: { connectorId: 1, meterValue: [] },
      };

      const context = new OcppContext('CP-001', 'mv-005');
      const result = (await handler.execute(message, context)) as any;

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
    });
  });

  describe('Connector & Transaction Handling', () => {
    it('should handle different connector IDs', async () => {
      const connectorIds = [0, 1, 2, 3, 4];

      for (const connectorId of connectorIds) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `mv-conn-${connectorId}`,
          action: 'MeterValues',
          payload: {
            connectorId,
            meterValue: [
              {
                timestamp: '2025-12-11T17:18:00Z',
                sampledValue: [{ value: '3000' }],
              },
            ],
          },
        };

        const context = new OcppContext('CP-001', `mv-conn-${connectorId}`);
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
      }
    });

    it('should handle various measurand types', async () => {
      const measurands = [
        'Energy.Active.Import.Register',
        'Voltage',
        'Current.Import',
        'Power.Active.Import',
        'Temperature',
      ];

      for (const measurand of measurands) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `mv-measurand-${measurand}`,
          action: 'MeterValues',
          payload: {
            connectorId: 1,
            transactionId: 12345,
            meterValue: [
              {
                timestamp: '2025-12-11T17:19:00Z',
                sampledValue: [{ value: '100', measurand }],
              },
            ],
          },
        };

        const context = new OcppContext(
          'CP-001',
          `mv-measurand-${measurand}`,
        );
        const result = (await handler.execute(message, context)) as any;

        expect(result[0]).toBe(3);
      }
    });
  });

  describe('Performance & Concurrency', () => {
    it('should complete within 100ms SLA', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'mv-perf',
        action: 'MeterValues',
        payload: {
          connectorId: 1,
          meterValue: [
            {
              timestamp: '2025-12-11T17:20:00Z',
              sampledValue: [{ value: '4000' }],
            },
          ],
        },
      };

      const context = new OcppContext('CP-001', 'mv-perf');
      const start = performance.now();

      await handler.execute(message, context);

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent meter value submissions', async () => {
      const messages: OcppCallRequest[] = Array.from({ length: 5 }, (_, i) => ({
        messageTypeId: 2,
        messageId: `mv-concurrent-${i}`,
        action: 'MeterValues',
        payload: {
          connectorId: (i % 3) + 1,
          meterValue: [
            {
              timestamp: '2025-12-11T17:21:00Z',
              sampledValue: [{ value: String(5000 + i * 100) }],
            },
          ],
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
        messageId: 'mv-compliance',
        action: 'MeterValues',
        payload: { connectorId: 1, meterValue: [] },
      };

      const context = new OcppContext('CP-001', 'mv-compliance');
      const result = (await handler.execute(message, context)) as any;

      expect(typeof result[0]).toBe('number');
      expect(typeof result[1]).toBe('string');
      expect(typeof result[2]).toBe('object');
    });

    it('should return empty object as response body', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'mv-empty',
        action: 'MeterValues',
        payload: {
          connectorId: 1,
          meterValue: [
            {
              timestamp: '2025-12-11T17:22:00Z',
              sampledValue: [{ value: '6000' }],
            },
          ],
        },
      };

      const context = new OcppContext('CP-001', 'mv-empty');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2]).toEqual({});
    });
  });
});
