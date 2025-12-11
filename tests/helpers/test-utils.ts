import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export function getHttpClient(app: INestApplication) {
  return request(app.getHttpServer());
}

export function createChargePointPayload(chargePointId: string = 'CP001') {
  return {
    chargePointId,
    vendor: 'TestVendor',
    model: 'TestModel',
    serialNumber: `SN-${Date.now()}`,
    firmwareVersion: '1.0.0',
  };
}

export function createTransactionPayload(chargePointId: string, connectorId: number = 1) {
  return {
    chargePointId,
    connectorId,
    idTag: `USER-${Date.now()}`,
    meterStart: 1000,
    timestamp: new Date().toISOString(),
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await sleep(100);
  }
  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}
