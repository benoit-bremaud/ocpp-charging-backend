import { Injectable, Logger } from '@nestjs/common';
import { ChargePointGateway } from './ChargePointGateway';

/**
 * Service: ChargePoint WebSocket Operations
 *
 * Orchestrates WebSocket communication with ChargePoints
 * Per CLEAN architecture: Orchestration layer (Use-case adjacent)
 */
@Injectable()
export class ChargePointWebSocketService {
  private logger = new Logger('ChargePointWebSocketService');

  constructor(private readonly chargePointGateway: ChargePointGateway) {}

  /**
   * Notify ChargePoint came online
   * TODO: Implement broadcast to monitoring clients
   */
  notifyChargePointOnline(chargePointId: string): void {
    this.logger.log(`✅ ChargePoint ${chargePointId} is ONLINE`);
    // Future: Broadcast to monitoring dashboard
  }

  /**
   * Notify ChargePoint went offline
   * TODO: Implement broadcast to monitoring clients
   */
  notifyChargePointOffline(chargePointId: string): void {
    this.logger.log(`🔌 ChargePoint ${chargePointId} is OFFLINE`);
    // Future: Broadcast to monitoring dashboard
  }

  /**
   * Send command to specific ChargePoint
   */
  sendCommandToChargePoint(
    chargePointId: string,
    messageId: string,
    action: string,
    payload: Record<string, any>,
  ): boolean {
    this.logger.debug(`Sending ${action} to ${chargePointId}`);
    return this.chargePointGateway.sendCommandToChargePoint(
      chargePointId,
      messageId,
      action,
      payload,
    );
  }

  /**
   * Check if ChargePoint is connected
   */
  isChargePointConnected(chargePointId: string): boolean {
    return this.chargePointGateway.isConnected(chargePointId);
  }

  /**
   * Get list of connected ChargePoints
   */
  getConnectedChargePoints(): string[] {
    return this.chargePointGateway.getConnectedChargePoints();
  }
}
