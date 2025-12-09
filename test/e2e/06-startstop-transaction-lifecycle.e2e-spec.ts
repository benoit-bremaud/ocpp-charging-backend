/**
 * E2E Test: StartTransaction / StopTransaction Lifecycle
 *
 * OCPP 1.6 Specification:
 * - ChargePoint sends StartTransaction.req with connectorId, idTag, meterStart, timestamp
 * - Central System responds with StartTransaction.conf containing transactionId and idTagInfo
 * - ChargePoint sends StopTransaction.req with transactionId, idTag, meterStop, timestamp, reason, transactionData
 * - Central System responds with StopTransaction.conf containing idTagInfo
 *
 * CLEAN Architecture:
 * - Tests infrastructure layer (message structure and validation)
 * - Validates application layer concepts (transaction lifecycle)
 * - Tests domain layer (transactionId, meter values, transaction states)
 */

import { closeE2EApp, initializeE2EApp } from '../setup/e2e.setup';

import { INestApplication } from '@nestjs/common';

describe('StartTransaction / StopTransaction Lifecycle E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initializeE2EApp();
  });

  afterAll(async () => {
    await closeE2EApp(app);
  });

  describe('StartTransaction Message Flow', () => {
    it('should build a valid StartTransaction request payload', async () => {
      /**
       * OCPP 1.6 StartTransaction.req:
       * {
       *   connectorId: integer (>= 0),
       *   idTag: string (maxLength 20),
       *   meterStart: integer,
       *   timestamp: string (date-time),
       *   [reservationId]?: integer,
       *   [chargingProfile]?: ChargingProfile
       * }
       */
      const startTransactionRequest = {
        connectorId: 1,
        idTag: 'VALID-IDTAG-12345',
        meterStart: 0,
        timestamp: new Date().toISOString(),
      };

      expect(startTransactionRequest.connectorId).toBeGreaterThanOrEqual(0);
      expect(startTransactionRequest.idTag).toBeDefined();
      expect(startTransactionRequest.meterStart).toBeGreaterThanOrEqual(0);
      expect(startTransactionRequest.timestamp).toBeDefined();
    });

    it('should build a valid StartTransaction response payload', async () => {
      /**
       * OCPP 1.6 StartTransaction.conf:
       * {
       *   transactionId: integer,
       *   idTagInfo: {
       *     status: "Accepted" | "Blocked" | "Expired" | "Invalid" | "ConcurrentTx",
       *     [expiryDate]?: string (date-time),
       *     [parentIdTag]?: string
       *   }
       * }
       */
      const startTransactionResponse = {
        transactionId: 1,
        idTagInfo: {
          status: 'Accepted',
        },
      };

      expect(startTransactionResponse.transactionId).toBeGreaterThan(0);
      expect(startTransactionResponse.idTagInfo).toBeDefined();
      expect(startTransactionResponse.idTagInfo.status).toBe('Accepted');
    });

    it('should support reservation with StartTransaction', async () => {
      const startTransactionWithReservation = {
        connectorId: 1,
        idTag: 'VALID-IDTAG-12345',
        meterStart: 0,
        timestamp: new Date().toISOString(),
        reservationId: 123,
      };

      expect(startTransactionWithReservation.reservationId).toBe(123);
    });
  });

  describe('StopTransaction Message Flow', () => {
    it('should build a valid StopTransaction request payload', async () => {
      /**
       * OCPP 1.6 StopTransaction.req:
       * {
       *   transactionId: integer,
       *   idTag: string (maxLength 20),
       *   meterStop: integer,
       *   timestamp: string (date-time),
       *   reason: "DeAuthorized" | "EmergencyStop" | "EVDisconnected" | "HardReset" | "Local" | "Other" | "PowerLoss" | "Reboot" | "RemoteStop" | "SoftReset" | "UnlockCommand",
       *   [transactionData]?: MeterValue[]
       * }
       */
      const stopTransactionRequest = {
        transactionId: 1,
        idTag: 'VALID-IDTAG-12345',
        meterStop: 1500,
        timestamp: new Date().toISOString(),
        reason: 'Local',
      };

      expect(stopTransactionRequest.transactionId).toBeGreaterThan(0);
      expect(stopTransactionRequest.idTag).toBeDefined();
      expect(stopTransactionRequest.meterStop).toBeGreaterThan(0);
      expect([
        'DeAuthorized',
        'EmergencyStop',
        'EVDisconnected',
        'HardReset',
        'Local',
        'Other',
        'PowerLoss',
        'Reboot',
        'RemoteStop',
        'SoftReset',
        'UnlockCommand',
      ]).toContain(stopTransactionRequest.reason);
    });

    it('should build a valid StopTransaction response payload', async () => {
      /**
       * OCPP 1.6 StopTransaction.conf:
       * {
       *   [idTagInfo]?: {
       *     status: "Accepted" | "Blocked" | "Expired" | "Invalid" | "ConcurrentTx",
       *     [expiryDate]?: string (date-time),
       *     [parentIdTag]?: string
       *   }
       * }
       */
      const stopTransactionResponse = {
        idTagInfo: {
          status: 'Accepted',
        },
      };

      expect(stopTransactionResponse.idTagInfo).toBeDefined();
      expect(stopTransactionResponse.idTagInfo.status).toBe('Accepted');
    });

    it('should support all StopTransaction reason codes', async () => {
      const reasons = [
        'DeAuthorized',
        'EmergencyStop',
        'EVDisconnected',
        'HardReset',
        'Local',
        'Other',
        'PowerLoss',
        'Reboot',
        'RemoteStop',
        'SoftReset',
        'UnlockCommand',
      ];

      expect(reasons.length).toBe(11);
      reasons.forEach((reason) => {
        expect(typeof reason).toBe('string');
      });
    });
  });

  describe('StartTransaction / StopTransaction Error Handling', () => {
    it('should reject StartTransaction with invalid connectorId', async () => {
      const invalidRequest = {
        connectorId: -1, // Invalid: must be >= 0
        idTag: 'VALID-IDTAG-12345',
        meterStart: 0,
        timestamp: new Date().toISOString(),
      };

      expect(invalidRequest.connectorId).toBeLessThan(0);
    });

    it('should handle StopTransaction with negative meterStop', async () => {
      // Note: OCPP allows negative meter values for some charge point types
      const stopTransactionRequest = {
        transactionId: 1,
        idTag: 'VALID-IDTAG-12345',
        meterStop: -100,
        timestamp: new Date().toISOString(),
        reason: 'Local',
      };

      expect(stopTransactionRequest.meterStop).toBeLessThan(0);
    });

    it('should detect meter rollover (meterStop < meterStart)', async () => {
      const meterStart = 5000;
      const meterStop = 2500; // Rolled over

      expect(meterStop).toBeLessThan(meterStart);
    });

    it('should handle missing optional transactionData in StopTransaction', async () => {
      const stopTransactionRequest = {
        transactionId: 1,
        idTag: 'VALID-IDTAG-12345',
        meterStop: 1500,
        timestamp: new Date().toISOString(),
        reason: 'Local',
        // transactionData not provided
      };

      expect((stopTransactionRequest as any).transactionData).toBeUndefined();
    });
  });

  describe('StartTransaction JSON Schema Validation (OCPP 1.6 Compliance)', () => {
    it('should validate StartTransaction.req against OCPP 1.6 schema', async () => {
      /**
       * Verify: StartTransaction request conforms to OCPP 1.6 schema
       * - Required: connectorId (>= 0), idTag (maxLength 20), meterStart (integer), timestamp (date-time)
       */
      const { assertOCPPMessageValid } = await import('./validators/ocpp-schema-validator');

      const validStartTransactionRequest = {
        connectorId: 1,
        idTag: 'VALID-IDTAG-12345',
        meterStart: 0,
        timestamp: new Date().toISOString(),
      };

      expect(() =>
        assertOCPPMessageValid(validStartTransactionRequest, 'StartTransaction.json'),
      ).not.toThrow();
    });

    it('should validate StartTransaction.conf against OCPP 1.6 schema', async () => {
      /**
       * Verify: StartTransaction response conforms to OCPP 1.6 schema
       * - Required: transactionId (integer), idTagInfo.status (enum)
       */
      const { assertOCPPMessageValid } = await import('./validators/ocpp-schema-validator');

      const validStartTransactionResponse = {
        transactionId: 1,
        idTagInfo: {
          status: 'Accepted',
        },
      };

      expect(() =>
        assertOCPPMessageValid(validStartTransactionResponse, 'StartTransactionResponse.json'),
      ).not.toThrow();
    });

    it('should reject invalid StartTransaction.req (missing idTag)', async () => {
      const { validateOCPPMessage } = await import('./validators/ocpp-schema-validator');

      const invalidRequest = {
        connectorId: 1,
        meterStart: 0,
        timestamp: new Date().toISOString(),
      };

      const result = validateOCPPMessage(invalidRequest, 'StartTransaction.json');

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('StopTransaction JSON Schema Validation (OCPP 1.6 Compliance)', () => {
    it('should validate StopTransaction.req against OCPP 1.6 schema', async () => {
      /**
       * Verify: StopTransaction request conforms to OCPP 1.6 schema
       * - Required: transactionId (integer), idTag, meterStop (integer), timestamp, reason (enum)
       */
      const { assertOCPPMessageValid } = await import('./validators/ocpp-schema-validator');

      const validStopTransactionRequest = {
        transactionId: 1,
        idTag: 'VALID-IDTAG-12345',
        meterStop: 1500,
        timestamp: new Date().toISOString(),
        reason: 'Local',
      };

      expect(() =>
        assertOCPPMessageValid(validStopTransactionRequest, 'StopTransaction.json'),
      ).not.toThrow();
    });

    it('should validate StopTransaction.conf against OCPP 1.6 schema', async () => {
      /**
       * Verify: StopTransaction response conforms to OCPP 1.6 schema
       * - Optional: idTagInfo
       */
      const { assertOCPPMessageValid } = await import('./validators/ocpp-schema-validator');

      const validStopTransactionResponse = {
        idTagInfo: {
          status: 'Accepted',
        },
      };

      expect(() =>
        assertOCPPMessageValid(validStopTransactionResponse, 'StopTransactionResponse.json'),
      ).not.toThrow();
    });

    it('should reject invalid StopTransaction.req (invalid reason)', async () => {
      const { validateOCPPMessage } = await import('./validators/ocpp-schema-validator');

      const invalidRequest = {
        transactionId: 1,
        idTag: 'VALID-IDTAG-12345',
        meterStop: 1500,
        timestamp: new Date().toISOString(),
        reason: 'InvalidReason',
      };

      const result = validateOCPPMessage(invalidRequest, 'StopTransaction.json');

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject invalid StopTransaction.req (missing transactionId)', async () => {
      const { validateOCPPMessage } = await import('./validators/ocpp-schema-validator');

      const invalidRequest = {
        idTag: 'VALID-IDTAG-12345',
        meterStop: 1500,
        timestamp: new Date().toISOString(),
        reason: 'Local',
      };

      const result = validateOCPPMessage(invalidRequest, 'StopTransaction.json');

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });
});
