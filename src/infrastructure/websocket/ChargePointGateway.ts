import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';

/**
 * Infrastructure Layer: WebSocket adapter (DISABLED for now).
 * Will be enabled once NestJS 11+ WebSocket driver is resolved.
 *
 * For now: Message processing happens via HTTP REST API
 */
@Injectable()
export class ChargePointGateway {
  private logger = new Logger('ChargePointGateway');
  private connectedClients: Map<string, any> = new Map();

  constructor() {
    this.logger.warn(
      'WebSocket gateway disabled (NestJS 9 compatibility). Use REST API for OCPP messages.',
    );
  }

  getConnectedChargePoints(): string[] {
    return Array.from(this.connectedClients.keys());
  }

  broadcastChargePointStatus(chargePointId: string, status: string): void {
    this.logger.debug(`[Mock] Status: ${chargePointId} → ${status}`);
  }

  sendToChargePoint(chargePointId: string, message: any): void {
    this.logger.debug(`[Mock] Message to ${chargePointId}: ${JSON.stringify(message)}`);
  }
}
