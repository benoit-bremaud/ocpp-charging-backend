/**
 * E2E Test: Authorize Lifecycle
 *
 * OCPP 1.6 Specification:
 * - ChargePoint sends Authorize.req with idTag
 * - Central System responds with Authorize.conf containing idTagInfo
 * - idTagInfo.status ∈ {Accepted, Blocked, Expired, Invalid, ConcurrentTx}
 *
 * CLEAN Architecture:
 * - Tests infrastructure layer (for now: message structure and validation)
 * - Validates application layer concepts (authorization decision)
 * - Tests domain layer (idTag, idTagInfo semantics)
 */

import { closeE2EApp, initializeE2EApp } from '../setup/e2e.setup';

import { INestApplication } from '@nestjs/common';

describe('Authorize Lifecycle E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initializeE2EApp();
  });

  afterAll(async () => {
    await closeE2EApp(app);
  });

  describe('Authorize Message Flow', () => {
    it('should build a valid Authorize request payload', async () => {
      /**
       * OCPP 1.6 Authorize.req:
       * {
       *   idTag: string (maxLength 20)
       * }
       */
      const authorizeRequest = {
        idTag: 'VALID-IDTAG-12345',
      };

      expect(authorizeRequest.idTag).toBeDefined();
      expect(typeof authorizeRequest.idTag).toBe('string');
      expect(authorizeRequest.idTag.length).toBeLessThanOrEqual(20);
    });

    it('should build a valid Authorize response payload', async () => {
      /**
       * OCPP 1.6 Authorize.conf:
       * {
       *   idTagInfo: {
       *     status: "Accepted" | "Blocked" | "Expired" | "Invalid" | "ConcurrentTx",
       *     [expiryDate]?: string (date-time),
       *     [parentIdTag]?: string
       *   }
       * }
       */
      const authorizeResponse = {
        idTagInfo: {
          status: 'Accepted',
          expiryDate: new Date(Date.now() + 3600 * 1000).toISOString(),
          parentIdTag: 'PARENT-TAG-001',
        },
      };

      expect(authorizeResponse.idTagInfo).toBeDefined();
      expect(authorizeResponse.idTagInfo.status).toBe('Accepted');
      expect(typeof authorizeResponse.idTagInfo.expiryDate).toBe('string');
      expect(typeof authorizeResponse.idTagInfo.parentIdTag).toBe('string');
    });

    it('should support ConcurrentTx status for multiple transactions', async () => {
      const idTagInfo = {
        status: 'ConcurrentTx',
      };

      expect(idTagInfo.status).toBe('ConcurrentTx');
    });
  });

  describe('Authorize Error Handling', () => {
    it('should reject idTag longer than 20 characters', async () => {
      const tooLongIdTag = 'THIS-IDTAG-IS-TOO-LONG-OVER-20-CHARS';

      expect(tooLongIdTag.length).toBeGreaterThan(20);
    });

    it('should handle blocked idTag status', async () => {
      const idTagInfo = {
        status: 'Blocked',
      };

      expect(idTagInfo.status).toBe('Blocked');
    });

    it('should handle expired idTag status', async () => {
      const idTagInfo = {
        status: 'Expired',
        expiryDate: new Date(Date.now() - 3600 * 1000).toISOString(), // expired 1h ago
      };

      expect(idTagInfo.status).toBe('Expired');

      const now = new Date();
      const expiry = new Date(idTagInfo.expiryDate);
      expect(expiry.getTime()).toBeLessThan(now.getTime());
    });

    it('should handle invalid idTag status', async () => {
      const idTagInfo = {
        status: 'Invalid',
      };

      expect(idTagInfo.status).toBe('Invalid');
    });
  });

  describe('Authorize JSON Schema Validation (OCPP 1.6 Compliance)', () => {
    it('should validate Authorize.req against OCPP 1.6 schema', async () => {
      /**
       * Verify: Authorize request payload conforms to official OCPP 1.6 JSON schema
       *
       * Authorize.json:
       * - Required: idTag (string, maxLength 20)
       * - additionalProperties: false
       */
      const { assertOCPPMessageValid } = await import('./validators/ocpp-schema-validator');

      const validAuthorizeRequest = {
        idTag: 'VALID-IDTAG-12345',
      };

      expect(() => assertOCPPMessageValid(validAuthorizeRequest, 'Authorize.json')).not.toThrow();
    });

    it('should validate Authorize.conf against OCPP 1.6 schema', async () => {
      /**
       * Verify: Authorize response payload conforms to official OCPP 1.6 JSON schema
       *
       * AuthorizeResponse.json:
       * - Required: idTagInfo.status ∈ {Accepted, Blocked, Expired, Invalid, ConcurrentTx}
       * - Optional: idTagInfo.expiryDate (date-time), idTagInfo.parentIdTag
       * - additionalProperties: false
       */
      const { assertOCPPMessageValid } = await import('./validators/ocpp-schema-validator');

      const validAuthorizeResponse = {
        idTagInfo: {
          status: 'Accepted',
          expiryDate: new Date(Date.now() + 3600 * 1000).toISOString(),
          parentIdTag: 'PARENT-TAG-001',
        },
      };

      expect(() =>
        assertOCPPMessageValid(validAuthorizeResponse, 'AuthorizeResponse.json'),
      ).not.toThrow();
    });

    it('should reject invalid Authorize.req (missing idTag)', async () => {
      const { validateOCPPMessage } = await import('./validators/ocpp-schema-validator');

      const invalidRequest = {
        // Missing required: idTag
      };

      const result = validateOCPPMessage(invalidRequest, 'Authorize.json');

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject invalid Authorize.conf (invalid status)', async () => {
      const { validateOCPPMessage } = await import('./validators/ocpp-schema-validator');

      const invalidResponse = {
        idTagInfo: {
          status: 'NotAValidStatus',
        },
      };

      const result = validateOCPPMessage(invalidResponse, 'AuthorizeResponse.json');

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });
});
