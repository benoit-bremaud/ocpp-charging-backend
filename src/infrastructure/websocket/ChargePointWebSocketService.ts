import { Injectable, Inject } from '@nestjs/common';
import { ChargePointGateway } from './ChargePointGateway';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../tokens';

/**
 * Application Layer: WebSocket service (DISABLED for now).
 * Will route OCPP messages via REST endpoints instead.
 */
@Injectable()
export class ChargePointWebSocketService {
  constructor(
    private readonly chargePointGateway: ChargePointGateway,
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepository: IChargePointRepository,
  ) {}

  async notifyChargePointOnline(chargePointId: string): Promise<void> {
    const chargePoint =
      await this.chargePointRepository.findByChargePointId(chargePointId);

    if (chargePoint) {
      this.chargePointGateway.broadcastChargePointStatus(
        chargePointId,
        'ONLINE',
      );
    }
  }

  async notifyChargePointOffline(chargePointId: string): Promise<void> {
    const chargePoint =
      await this.chargePointRepository.findByChargePointId(chargePointId);

    if (chargePoint) {
      this.chargePointGateway.broadcastChargePointStatus(
        chargePointId,
        'OFFLINE',
      );
    }
  }

  getConnectedChargePoints(): string[] {
    return this.chargePointGateway.getConnectedChargePoints();
  }

  sendCommandToChargePoint(chargePointId: string, command: any): void {
    this.chargePointGateway.sendToChargePoint(chargePointId, command);
  }
}
