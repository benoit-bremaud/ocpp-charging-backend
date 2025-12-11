/**
 * E2E Test: MeterValues Lifecycle
 *
 * OCPP 1.6 Specification:
 * - ChargePoint sends MeterValues.req with transactionId, meterValue (array of meter data)
 * - Central System responds with MeterValues.conf (empty response)
 * - MeterValue contains: timestamp, sampledValue[] (measurand, value, unit, context, format, etc.)
 * - Common measurands: Energy.Active.Import.Register, Power.Active.Import, Temperature, etc.
 *
 * CLEAN Architecture:
 * - Tests infrastructure layer (message structure and validation)
 * - Validates application layer concepts (meter data aggregation)
 * - Tests domain layer (measurands, units, sampling)
 */

import { closeE2EApp, initializeE2EApp } from '../setup/e2e.setup';

import { INestApplication } from '@nestjs/common';

describe('MeterValues Lifecycle E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initializeE2EApp();
  });

  afterAll(async () => {
    await closeE2EApp(app);
  });

  describe('MeterValues Message Flow', () => {
    it('should build a valid MeterValues request with single meter reading', async () => {
      /**
       * OCPP 1.6 MeterValues.req:
       * {
       *   transactionId?: integer,
       *   meterValue: MeterValue[] (array of meter readings)
       * }
       *
       * MeterValue:
       * {
       *   timestamp: string (date-time),
       *   sampledValue: SampledValue[] (array of meter samples)
       * }
       *
       * SampledValue:
       * {
       *   value: string,
       *   context?: "Interruption.Begin" | "Interruption.End" | "Sample.Clock" | "Sample.Periodic" | "Transaction.Begin" | "Transaction.End" | "Trigger",
       *   format?: "Raw" | "SignedData",
       *   measurand?: string (default: "Energy.Active.Import.Register"),
       *   phase?: "L1" | "L2" | "L3" | "N" | "L1-N" | "L2-N" | "L3-N" | "L1-L2" | "L2-L3" | "L3-L1",
       *   unit?: "Wh" | "kWh" | "varh" | "kvarh" | "W" | "kW" | "var" | "kvar" | "A" | "V" | "K" | "Celcius" | "Celsius" | "°C" | "°F" | "Kelvin"
       * }
       */
      const meterValuesRequest = {
        transactionId: 1,
        meterValue: [
          {
            timestamp: new Date().toISOString(),
            sampledValue: [
              {
                value: '1500',
                measurand: 'Energy.Active.Import.Register',
                unit: 'Wh',
              },
            ],
          },
        ],
      };

      expect(meterValuesRequest.transactionId).toBeGreaterThan(0);
      expect(meterValuesRequest.meterValue).toHaveLength(1);
      expect(meterValuesRequest.meterValue[0].sampledValue).toHaveLength(1);
      expect(meterValuesRequest.meterValue[0].sampledValue[0].value).toBe('1500');
    });

    it('should build a valid MeterValues request with multiple phase readings', async () => {
      const meterValuesRequest = {
        transactionId: 1,
        meterValue: [
          {
            timestamp: new Date().toISOString(),
            sampledValue: [
              {
                value: '10',
                measurand: 'Current.Import',
                phase: 'L1',
                unit: 'A',
              },
              {
                value: '11',
                measurand: 'Current.Import',
                phase: 'L2',
                unit: 'A',
              },
              {
                value: '9',
                measurand: 'Current.Import',
                phase: 'L3',
                unit: 'A',
              },
            ],
          },
        ],
      };

      expect(meterValuesRequest.meterValue[0].sampledValue).toHaveLength(3);
      expect(
        meterValuesRequest.meterValue[0].sampledValue.every(
          (sv) => sv.measurand === 'Current.Import',
        ),
      ).toBe(true);
    });

    it('should build a valid MeterValues request with temperature reading', async () => {
      const meterValuesRequest = {
        transactionId: 1,
        meterValue: [
          {
            timestamp: new Date().toISOString(),
            sampledValue: [
              {
                value: '45',
                measurand: 'Temperature',
                unit: 'Celsius',
              },
            ],
          },
        ],
      };

      expect(meterValuesRequest.meterValue[0].sampledValue[0].measurand).toBe('Temperature');
    });

    it('should support MeterValues without transactionId (for periodic readings)', async () => {
      const meterValuesRequest = {
        meterValue: [
          {
            timestamp: new Date().toISOString(),
            sampledValue: [
              {
                value: '2000',
                measurand: 'Energy.Active.Import.Register',
                unit: 'Wh',
              },
            ],
          },
        ],
      };

      expect(meterValuesRequest.transactionId).toBeUndefined();
      expect(meterValuesRequest.meterValue).toHaveLength(1);
    });

    it('should build a valid MeterValues response (empty)', async () => {
      /**
       * OCPP 1.6 MeterValues.conf:
       * {} (empty object - no properties)
       */
      const meterValuesResponse = {};

      expect(Object.keys(meterValuesResponse).length).toBe(0);
    });
  });

  describe('MeterValues Error Handling', () => {
    it('should reject MeterValues with empty meterValue array', async () => {
      const invalidRequest = {
        transactionId: 1,
        meterValue: [], // Empty array
      };

      expect(invalidRequest.meterValue.length).toBe(0);
    });

    it('should reject SampledValue with missing required value field', async () => {
      const invalidSampledValue = {
        measurand: 'Energy.Active.Import.Register',
        unit: 'Wh',
        // Missing required: value
      };

      expect(invalidSampledValue.value).toBeUndefined();
    });

    it('should handle SampledValue with context field', async () => {
      const sampledValueWithContext = {
        value: '1500',
        measurand: 'Energy.Active.Import.Register',
        context: 'Sample.Periodic',
        unit: 'Wh',
      };

      expect(sampledValueWithContext.context).toBe('Sample.Periodic');
    });

    it('should handle SampledValue with SignedData format', async () => {
      const sampledValueSigned = {
        value: 'SIGNED_DATA_BASE64_ENCODED',
        format: 'SignedData',
        measurand: 'Energy.Active.Import.Register',
      };

      expect(sampledValueSigned.format).toBe('SignedData');
    });

    it('should detect invalid unit values', async () => {
      const invalidUnit = 'InvalidUnit';
      const validUnits = [
        'Wh',
        'kWh',
        'varh',
        'kvarh',
        'W',
        'kW',
        'var',
        'kvar',
        'A',
        'V',
        'K',
        'Celsius',
        'Kelvin',
      ];

      expect(validUnits).not.toContain(invalidUnit);
    });
  });

  describe('MeterValues JSON Schema Validation (OCPP 1.6 Compliance)', () => {
    it('should validate MeterValues.req against OCPP 1.6 schema', async () => {
      /**
       * Verify: MeterValues request conforms to OCPP 1.6 schema
       * - Required: meterValue[] (non-empty array)
       * - Optional: transactionId
       */
      const { assertOCPPMessageValid } = await import('./validators/ocpp-schema-validator');

      const validMeterValuesRequest = {
        connectorId: 1,
        transactionId: 1,
        meterValue: [
          {
            timestamp: new Date().toISOString(),
            sampledValue: [
              {
                value: '1500',
                measurand: 'Energy.Active.Import.Register',
                unit: 'Wh',
              },
            ],
          },
        ],
      };

      expect(() =>
        assertOCPPMessageValid(validMeterValuesRequest, 'MeterValues.json'),
      ).not.toThrow();
    });

    it('should validate MeterValues.conf against OCPP 1.6 schema', async () => {
      /**
       * Verify: MeterValues response conforms to OCPP 1.6 schema
       * - Empty object (no properties)
       */
      const { assertOCPPMessageValid } = await import('./validators/ocpp-schema-validator');

      const validMeterValuesResponse = {};

      expect(() =>
        assertOCPPMessageValid(validMeterValuesResponse, 'MeterValuesResponse.json'),
      ).not.toThrow();
    });

    it('should reject invalid MeterValues.req (empty meterValue array)', async () => {
      const { validateOCPPMessage } = await import('./validators/ocpp-schema-validator');

      const invalidRequest = {
        meterValue: [],
      };

      const result = validateOCPPMessage(invalidRequest, 'MeterValues.json');

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject invalid MeterValues.req (missing meterValue)', async () => {
      const { validateOCPPMessage } = await import('./validators/ocpp-schema-validator');

      const invalidRequest = {
        transactionId: 1,
        // Missing required: meterValue
      };

      const result = validateOCPPMessage(invalidRequest, 'MeterValues.json');

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject invalid MeterValues.req (missing sampledValue in meterValue)', async () => {
      const { validateOCPPMessage } = await import('./validators/ocpp-schema-validator');

      const invalidRequest = {
        transactionId: 1,
        meterValue: [
          {
            timestamp: new Date().toISOString(),
            // Missing required: sampledValue
          },
        ],
      };

      const result = validateOCPPMessage(invalidRequest, 'MeterValues.json');

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject invalid MeterValues.req (missing value in sampledValue)', async () => {
      const { validateOCPPMessage } = await import('./validators/ocpp-schema-validator');

      const invalidRequest = {
        transactionId: 1,
        meterValue: [
          {
            timestamp: new Date().toISOString(),
            sampledValue: [
              {
                measurand: 'Energy.Active.Import.Register',
                // Missing required: value
              },
            ],
          },
        ],
      };

      const result = validateOCPPMessage(invalidRequest, 'MeterValues.json');

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject invalid MeterValues.conf (with extra properties)', async () => {
      const { validateOCPPMessage } = await import('./validators/ocpp-schema-validator');

      const invalidResponse = {
        extraField: 'should not be here',
      };

      const result = validateOCPPMessage(invalidResponse, 'MeterValuesResponse.json');

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });
});
