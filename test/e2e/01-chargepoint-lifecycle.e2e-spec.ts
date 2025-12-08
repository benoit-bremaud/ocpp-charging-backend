/**
 * E2E Test: ChargePoint Lifecycle
 */

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { initializeE2EApp, closeE2EApp } from '../setup/e2e.setup';

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
    const response = await request(httpServer)
      .get('/health')
      .expect(200);

    expect(response.body).toBeDefined();
  });

  it('should create a new ChargePoint', async () => {
    // ✅ CORRECT payload matching CreateChargePointInput DTO
    const createPayload = {
      chargePointId: 'CP-LIFECYCLE-E2E-001',
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
    expect(response.body.chargePointId).toBe('CP-LIFECYCLE-E2E-001');
    expect(response.body.chargePointVendor).toBe('TestVendor');
    expect(response.body.chargePointModel).toBe('TestModel-v1');
  });

  it('should retrieve all ChargePoints', async () => {
    const response = await request(httpServer)
      .get('/charge-points')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
