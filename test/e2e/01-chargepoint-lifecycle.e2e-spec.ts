/**
 * E2E Test: ChargePoint Lifecycle
 */

import { closeE2EApp, initializeE2EApp } from '../setup/e2e.setup';

import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('ChargePoint Lifecycle E2E Tests', () => {
  let app: INestApplication;
  let httpServer: any;

  beforeAll(async () => {
    app = await initializeE2EApp();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await closeE2EApp(app);
  });

  it('should return 200 OK on health endpoint', async () => {
    const response = await request(httpServer).get('/health').expect(200);

    expect(response.body).toBeDefined();
  });

  it('should create a new ChargePoint', async () => {
    // ✅ CORRECT payload matching CreateChargePointInput DTO
    const createPayload = {
      chargePointId: 'CP-CRUD-E2E-001',
      chargePointVendor: 'TestVendor',
      chargePointModel: 'TestModel-v1',
      firmwareVersion: '1.0.0',
      iccid: null,
      imsi: null,
      webSocketUrl: null,
    };

    const response = await request(httpServer)
      .post('/charge-points')
      .send(createPayload)
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.chargePointId).toBe('CP-CRUD-E2E-001');
    expect(response.body.chargePointVendor).toBe('TestVendor');
    expect(response.body.chargePointModel).toBe('TestModel-v1');
  });

  it('should retrieve all ChargePoints', async () => {
    const response = await request(httpServer).get('/charge-points').expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
});

describe('ChargePoint DTO Schema Validation (REST API Compliance)', () => {
  it('should validate CreateChargePointRequest DTO', async () => {
    /**
     * Verify: CreateChargePoint request DTO conforms to internal schema
     * Infrastructure: DTO validation layer
     *
     * CreateChargePointRequest:
     * - Required: chargePointId, chargePointVendor, chargePointModel
     * - Optional: firmwareVersion, iccid, imsi, webSocketUrl
     * - additionalProperties: false
     */
    const { assertOCPPMessageValid } = await import('./validators/ocpp-schema-validator');

    const validCreateRequest = {
      chargePointId: 'CP-CRUD-E2E-001',
      chargePointVendor: 'TestVendor',
      chargePointModel: 'TestModel',
      firmwareVersion: '1.0.0',
      iccid: null,
      imsi: null,
      webSocketUrl: null,
    };

    expect(() =>
      assertOCPPMessageValid(validCreateRequest, 'CreateChargePointRequest.json'),
    ).not.toThrow();
  });

  it('should validate ChargePointResponse DTO', async () => {
    /**
     * Verify: ChargePoint response DTO conforms to internal schema
     * Infrastructure: DTO validation layer
     *
     * ChargePointResponse:
     * - Required: id, chargePointId, chargePointVendor, chargePointModel, status, heartbeatInterval, createdAt, updatedAt
     * - Status: one of OCPP statuses or OFFLINE (internal)
     * - additionalProperties: false
     */
    const { assertOCPPMessageValid } = await import('./validators/ocpp-schema-validator');

    const validResponse = {
      id: 1,
      chargePointId: 'CP-CRUD-E2E-001',
      chargePointVendor: 'TestVendor',
      chargePointModel: 'TestModel',
      firmwareVersion: '1.0.0',
      status: 'OFFLINE',
      heartbeatInterval: 300,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => assertOCPPMessageValid(validResponse, 'ChargePointResponse.json')).not.toThrow();
  });

  it('should reject invalid CreateChargePointRequest (missing chargePointId)', async () => {
    const { validateOCPPMessage } = await import('./validators/ocpp-schema-validator');

    const invalidRequest = {
      chargePointVendor: 'TestVendor',
      chargePointModel: 'TestModel',
    };

    const result = validateOCPPMessage(invalidRequest, 'CreateChargePointRequest.json');

    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should reject invalid ChargePointResponse (invalid status)', async () => {
    const { validateOCPPMessage } = await import('./validators/ocpp-schema-validator');

    const invalidResponse = {
      id: 1,
      chargePointId: 'CP-TEST',
      chargePointVendor: 'TestVendor',
      chargePointModel: 'TestModel',
      status: 'InvalidStatus',
      heartbeatInterval: 300,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = validateOCPPMessage(invalidResponse, 'ChargePointResponse.json');

    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });
});
