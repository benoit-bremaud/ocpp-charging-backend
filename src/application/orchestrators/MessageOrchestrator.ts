import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { HandleBootNotification } from '../use-cases/HandleBootNotification';
import { HandleAuthorize } from '../use-cases/HandleAuthorize';
import { HandleHeartbeat } from '../use-cases/HandleHeartbeat';
import { HandleStatusNotification } from '../use-cases/HandleStatusNotification';
import { HandleFirmwareStatusNotification } from '../use-cases/HandleFirmwareStatusNotification';
import { HandleDiagnosticsStatusNotification } from '../use-cases/HandleDiagnosticsStatusNotification';
import { HandleReserveNow } from '../use-cases/HandleReserveNow';
import { HandleCancelReservation } from '../use-cases/HandleCancelReservation';

/**
 * Strategy Pattern: Router central pour messages OCPP
 * Dispatcher qui mappe actions → handlers
 * 
 * SOLID: S (routing responsibility), O (extensible handler registry)
 */
@Injectable()
export class MessageOrchestrator {
  private handlers = new Map<string, any>();

  constructor(
    private bootNotification: HandleBootNotification,
    private authorize: HandleAuthorize,
    private heartbeat: HandleHeartbeat,
    private statusNotification: HandleStatusNotification,
    private firmwareStatusNotification: HandleFirmwareStatusNotification,
    private diagnosticsStatusNotification: HandleDiagnosticsStatusNotification,
    private reserveNow: HandleReserveNow,
    private cancelReservation: HandleCancelReservation
  ) {
    this.initializeHandlers();
  }

  /**
   * Initialiser la registry des handlers
   */
  private initializeHandlers(): void {
    this.handlers.set('BootNotification', this.bootNotification);
    this.handlers.set('Authorize', this.authorize);
    this.handlers.set('Heartbeat', this.heartbeat);
    this.handlers.set('StatusNotification', this.statusNotification);
    this.handlers.set('FirmwareStatusNotification', this.firmwareStatusNotification);
    this.handlers.set('DiagnosticsStatusNotification', this.diagnosticsStatusNotification);
    this.handlers.set('ReserveNow', this.reserveNow);
    this.handlers.set('CancelReservation', this.cancelReservation);
  }

  /**
   * Router central: dispatcher le message vers le bon handler
   */
  async route(chargePointId: string, action: string, input: any): Promise<any> {
    const handler = this.handlers.get(action);

    if (!handler) {
      throw new NotFoundException(`Handler not found for action: ${action}`);
    }

    if (typeof handler.execute !== 'function') {
      throw new BadRequestException(`Invalid handler for action: ${action}`);
    }

    return handler.execute(chargePointId, input);
  }

  /**
   * Obtenir la liste des actions supportées
   */
  getSupportedActions(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Vérifier si une action est supportée
   */
  isActionSupported(action: string): boolean {
    return this.handlers.has(action);
  }
}
