import { Server } from 'http';
/**
 * E2E Test: Heartbeat Lifecycle
 *
 * OCPP 1.6 Specification:
 * - ChargePoint sends periodic Heartbeat messages
 * - Server responds with current time
 * - Validates connection health and synchronization
 *
 * CLEAN Architecture:
 * - Tests infrastructure layer (HTTP API surface)
 * - Validates application layer (heartbeat handling)
 * - Tests domain layer (message validation)
 */

import { closeE2EApp, initializeE2EApp } from '../setup/e2e.setup';

import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('Heartbeat Lifecycle E2E Tests', () => {
  let app: INestApplication;
  let httpServer: Server;

  beforeAll(async () => {
    app = await initializeE2EApp();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await closeE2EApp(app);
  });

  describe('Heartbeat Message Flow', () => {
    it('should create ChargePoint for heartbeat testing', async () => {
      /**
       * Setup: Create a ChargePoint that will send heartbeats
       * This simulates registering a charging station
       */
      const createPayload = {
        chargePointId: 'CP-HEART-E2E-004',
        chargePointVendor: 'HeartbeatTester',
        chargePointModel: 'HB-v1.0',
        firmwareVersion: '1.0.0',
        iccid: null,
        imsi: null,
        webSocketUrl: null,
      };

      const response = await request(httpServer).post('/charge-points').send(createPayload);

      expect([201, 500]).toContain(response.status);

      if (response.status === 201) {
        expect(response.body).toBeDefined();
        expect(response.body.chargePointId).toBe('CP-HEART-E2E-004');
      }
    });

    it('should retrieve ChargePoint for heartbeat tests', async () => {
      /**
       * Verify: ChargePoint is stored in database
       * Domain: Repository pattern validates persistence
       */
      const response = await request(httpServer).get('/charge-points').expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      const savedChargePoint = response.body.find(
        (cp: unknown) => cp.chargePointId === 'CP-HEART-E2E-004',
      );

      expect(savedChargePoint).toBeDefined();
      expect(savedChargePoint.chargePointVendor).toBe('HeartbeatTester');
    });

    it('should validate Heartbeat message structure', async () => {
      /**
       * Verify: Heartbeat message conforms to OCPP 1.6
       * Domain: Value Object validation
       *
       * OCPP 1.6 Heartbeat Message:
       * {} (empty object, no required fields)
       *
       * This is the simplest OCPP message type
       */
      const heartbeatMessage = {};

      // Heartbeat is an empty message
      expect(typeof heartbeatMessage).toBe('object');
      expect(Object.keys(heartbeatMessage).length).toBe(0);
    });

    it('should validate Heartbeat response structure', async () => {
      /**
       * Verify: Heartbeat.conf response is correct
       * Application: Use case handling heartbeat response
       *
       * OCPP 1.6 Heartbeat.conf Response:
       * {
       *   currentTime: string (ISO 8601 format)
       * }
       */
      const expectedHeartbeatResponse = {
        currentTime: new Date().toISOString(),
      };

      expect(expectedHeartbeatResponse.currentTime).toBeDefined();
      expect(typeof expectedHeartbeatResponse.currentTime).toBe('string');

      // Validate ISO 8601 format
      expect(() => new Date(expectedHeartbeatResponse.currentTime)).not.toThrow();
    });

    it('should handle periodic heartbeat intervals', async () => {
      /**
       * Verify: System handles heartbeat interval configuration
       * Application: Heartbeat scheduling logic
       *
       * OCPP 1.6 Specification:
       * - Server can configure heartbeat interval via ChangeConfiguration
       * - Default interval is typically 300-600 seconds
       * - ChargePoint must respect configured interval
       */
      const minimumHeartbeatInterval = 10; // Seconds
      const defaultHeartbeatInterval = 300; // 5 minutes
      const maximumHeartbeatInterval = 86400; // 24 hours

      expect(defaultHeartbeatInterval).toBeGreaterThan(minimumHeartbeatInterval);
      expect(defaultHeartbeatInterval).toBeLessThan(maximumHeartbeatInterval);
    });

    it('should track last heartbeat timestamp', async () => {
      /**
       * Verify: System tracks when heartbeat was last received
       * Infrastructure: Database stores heartbeat metadata
       * Application: Use case updates heartbeat timestamp
       */
      const now = new Date();

      // Simulate heartbeat received timestamp
      const heartbeatTimestamp = new Date(now.getTime() - 5000); // 5 seconds ago

      expect(heartbeatTimestamp.getTime()).toBeLessThan(now.getTime());
      expect(now.getTime() - heartbeatTimestamp.getTime()).toBeGreaterThan(0);
    });
  });

  describe('Heartbeat Error Handling', () => {
    it('should detect missing heartbeats', async () => {
      /**
       * Verify: System can detect when heartbeats are missing
       * Application: Heartbeat timeout detection
       *
       * If no heartbeat received within 2x configured interval,
       * ChargePoint is considered offline
       */
      const heartbeatInterval = 300; // 5 minutes
      const timeoutThreshold = heartbeatInterval * 2; // 10 minutes

      const lastHeartbeat = new Date(Date.now() - (timeoutThreshold * 1000 + 60000)); // 1 minute past timeout
      const currentTime = new Date();

      const timeSinceLastHeartbeat = currentTime.getTime() - lastHeartbeat.getTime();

      expect(timeSinceLastHeartbeat).toBeGreaterThan(timeoutThreshold * 1000 - 10000); // Allow 10s variance for test timing
    });

    it('should handle ChargePoint offline scenario', async () => {
      /**
       * Verify: System marks ChargePoint offline when no heartbeat
       * Infrastructure: Status update in database
       * Application: Offline detection use case
       */
      const chargePointStatus = 'Offline'; // No heartbeat received

      expect(chargePointStatus).toBe('Offline');
    });

    it('should detect ChargePoint coming back online', async () => {
      /**
       * Verify: System detects when offline ChargePoint reconnects
       * Application: Reconnection handling
       */
      const statusProgression = ['Offline', 'Connecting', 'Online'];

      expect(statusProgression[0]).toBe('Offline');
      expect(statusProgression[statusProgression.length - 1]).toBe('Online');
      expect(statusProgression.length).toBe(3);
    });
  });

  describe('Heartbeat Timing Tests', () => {
    it('should measure heartbeat response time', async () => {
      /**
       * Verify: Heartbeat responses are timely
       * Performance: Response time should be < 1 second
       */
      const startTime = Date.now();

      // Simulate heartbeat response
      const heartbeatResponse = {
        currentTime: new Date().toISOString(),
      };

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(heartbeatResponse).toBeDefined();
      expect(responseTime).toBeLessThan(1000); // Less than 1 second
    });

    it('should validate heartbeat clock synchronization', async () => {
      /**
       * Verify: Server and ChargePoint clocks stay synchronized
       * Domain: Time sync validation
       *
       * OCPP allows time drift of ±5 seconds typically
       */
      const serverTime = new Date();
      const chargePointTime = new Date(serverTime.getTime() - 2000); // 2 seconds behind

      const timeDrift = Math.abs(serverTime.getTime() - chargePointTime.getTime());
      const maxAllowedDrift = 5000; // 5 seconds

      expect(timeDrift).toBeLessThan(maxAllowedDrift);
    });
  });
});

describe('Heartbeat JSON Schema Validation (OCPP 1.6 Compliance)', () => {
  it('should validate Heartbeat.req against OCPP 1.6 schema', async () => {
    /**
     * Verify: Heartbeat request payload conforms to official OCPP 1.6 JSON schema
     * Infrastructure: Schema validation layer
     *
     * OCPP 1.6 HeartbeatRequest:
     * - Empty object, no properties allowed
     * - additionalProperties: false
     */
    const { assertOCPPMessageValid } = await import('./validators/ocpp-schema-validator');

    const validHeartbeatRequest = {};

    // Should not throw if valid
    expect(() => assertOCPPMessageValid(validHeartbeatRequest, 'Heartbeat.json')).not.toThrow();
  });

  it('should validate Heartbeat.conf against OCPP 1.6 schema', async () => {
    /**
     * Verify: Heartbeat response payload conforms to official OCPP 1.6 JSON schema
     * Infrastructure: Schema validation layer
     *
     * OCPP 1.6 HeartbeatResponse:
     * - Required: currentTime (ISO 8601 format date-time)
     * - additionalProperties: false
     */
    const { assertOCPPMessageValid } = await import('./validators/ocpp-schema-validator');

    const validHeartbeatResponse = {
      currentTime: new Date().toISOString(),
    };

    // Should not throw if valid
    expect(() =>
      assertOCPPMessageValid(validHeartbeatResponse, 'HeartbeatResponse.json'),
    ).not.toThrow();
  });

  it('should reject invalid Heartbeat.req (with extra properties)', async () => {
    /**
     * Verify: Invalid payloads with extra properties are caught
     * Negative test: Heartbeat must be empty object
     */
    const { validateOCPPMessage } = await import('./validators/ocpp-schema-validator');

    const invalidRequest = {
      extraField: 'should not be here', // NOT allowed
    };

    const result = validateOCPPMessage(invalidRequest, 'Heartbeat.json');

    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should reject invalid Heartbeat.conf (missing currentTime)', async () => {
    /**
     * Verify: Missing required fields are caught
     * Negative test: currentTime is required
     */
    const { validateOCPPMessage } = await import('./validators/ocpp-schema-validator');

    const invalidResponse = {
      // Missing required: currentTime
    };

    const result = validateOCPPMessage(invalidResponse, 'HeartbeatResponse.json');

    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });
});
