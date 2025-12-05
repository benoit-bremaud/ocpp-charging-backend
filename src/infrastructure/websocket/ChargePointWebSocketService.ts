import { Injectable, Inject } from '@nestjs/common';
import { ChargePointGateway } from './ChargePointGateway';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../tokens';

/**
 * Application Layer: WebSocket service orchestrating gateway + repository.
 *
 * CLEAN: Service = business logic for real-time updates.
 * SOLID: Depends on gateway (infrastructure) + IChargePointRepository (domain).
 */
@Injectable()
export class ChargePointWebSocketService {
  constructor(
    private readonly chargePointGateway: ChargePointGateway,
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepository: IChargePointRepository,
  ) {}

  /**
   * Broadcast that a ChargePoint came online.
   */
  async notifyChargePointOnline(chargePointId: string): Promise<void> {
    const chargePoint =
      await this.chargePointRepository.findByChargePointId(chargePointId);

    if (chargePoint) {
      this.chargePointGateway.broadcastChargePointStatus(
        chargePointId,
        'ONLINE',
      );
      console.log(`[WebSocketService] ChargePoint online: ${chargePointId}`);
    }
  }

  /**
   * Broadcast that a ChargePoint went offline.
   */
  async notifyChargePointOffline(chargePointId: string): Promise<void> {
    const chargePoint =
      await this.chargePointRepository.findByChargePointId(chargePointId);

    if (chargePoint) {
      this.chargePointGateway.broadcastChargePointStatus(
        chargePointId,
        'OFFLINE',
      );
      console.log(`[WebSocketService] ChargePoint offline: ${chargePointId}`);
    }
  }

  /**
   * Get all currently connected ChargePoints.
   */
  getConnectedChargePoints(): string[] {
    return this.chargePointGateway.getConnectedChargePoints();
  }

  /**
   * Send OCPP command to ChargePoint.
   */
  sendCommandToChargePoint(chargePointId: string, command: any): void {
    this.chargePointGateway.sendToChargePoint(chargePointId, command);
  }
}
