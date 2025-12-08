import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { HandleBootNotification } from '../use-cases/HandleBootNotification';
import { HandleAuthorize } from '../use-cases/HandleAuthorize';
import { HandleHeartbeat } from '../use-cases/HandleHeartbeat';
import { HandleStatusNotification } from '../use-cases/HandleStatusNotification';
import { HandleFirmwareStatusNotification } from '../use-cases/HandleFirmwareStatusNotification';
import { HandleDiagnosticsStatusNotification } from '../use-cases/HandleDiagnosticsStatusNotification';
import { HandleReserveNow } from '../use-cases/HandleReserveNow';
import { HandleCancelReservation } from '../use-cases/HandleCancelReservation';
import { HandleRemoteStartTransaction } from '../use-cases/HandleRemoteStartTransaction';
import { HandleRemoteStopTransaction } from '../use-cases/HandleRemoteStopTransaction';
import { HandleReset } from '../use-cases/HandleReset';
import { HandleUnlockConnector } from '../use-cases/HandleUnlockConnector';
import { HandleTriggerMessage } from '../use-cases/HandleTriggerMessage';
import { HandleChangeConfiguration } from '../use-cases/HandleChangeConfiguration';
import { HandleChangeAvailability } from '../use-cases/HandleChangeAvailability';
import { HandleSetChargingProfile } from '../use-cases/HandleSetChargingProfile';

/**
 * Strategy Pattern: Router central pour messages OCPP
 * Dispatcher qui mappe actions → handlers
 * 
 * SOLID: S (routing responsibility), O (extensible handler registry)
 * 
 * Phase Coverage:
 *   - Phase 3: BootNotification, Authorize, Heartbeat
 *   - Phase 4: StatusNotification, FirmwareStatusNotification, DiagnosticsStatusNotification
 *   - Phase 5: ReserveNow, CancelReservation
 *   - Phase 6: RemoteStartTransaction, RemoteStopTransaction, Reset, UnlockConnector, 
 *             TriggerMessage, ChangeConfiguration, ChangeAvailability, SetChargingProfile
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
    private cancelReservation: HandleCancelReservation,
    private remoteStartTransaction: HandleRemoteStartTransaction,
    private remoteStopTransaction: HandleRemoteStopTransaction,
    private reset: HandleReset,
    private unlockConnector: HandleUnlockConnector,
    private triggerMessage: HandleTriggerMessage,
    private changeConfiguration: HandleChangeConfiguration,
    private changeAvailability: HandleChangeAvailability,
    private setChargingProfile: HandleSetChargingProfile,
  ) {
    this.initializeHandlers();
  }

  /**
   * Initialiser la registry des handlers
   * 
   * Phase 3-5: Core + Notifications + Reservations
   * Phase 6: Remote Control Commands
   */
  private initializeHandlers(): void {
    // Phase 3: Core Messages
    this.handlers.set('BootNotification', this.bootNotification);
    this.handlers.set('Authorize', this.authorize);
    this.handlers.set('Heartbeat', this.heartbeat);

    // Phase 4: Notifications
    this.handlers.set('StatusNotification', this.statusNotification);
    this.handlers.set('FirmwareStatusNotification', this.firmwareStatusNotification);
    this.handlers.set('DiagnosticsStatusNotification', this.diagnosticsStatusNotification);

    // Phase 5: Reservations
    this.handlers.set('ReserveNow', this.reserveNow);
    this.handlers.set('CancelReservation', this.cancelReservation);

    // Phase 6: Remote Control (OCPP § 3.15-3.22)
    this.handlers.set('RemoteStartTransaction', this.remoteStartTransaction);
    this.handlers.set('RemoteStopTransaction', this.remoteStopTransaction);
    this.handlers.set('Reset', this.reset);
    this.handlers.set('UnlockConnector', this.unlockConnector);
    this.handlers.set('TriggerMessage', this.triggerMessage);
    this.handlers.set('ChangeConfiguration', this.changeConfiguration);
    this.handlers.set('ChangeAvailability', this.changeAvailability);
    this.handlers.set('SetChargingProfile', this.setChargingProfile);
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

  /**
   * Obtenir les handlers par phase
   */
  getHandlersByPhase(phase: number): string[] {
    const phaseMap: { [key: number]: string[] } = {
      3: ['BootNotification', 'Authorize', 'Heartbeat'],
      4: ['StatusNotification', 'FirmwareStatusNotification', 'DiagnosticsStatusNotification'],
      5: ['ReserveNow', 'CancelReservation'],
      6: ['RemoteStartTransaction', 'RemoteStopTransaction', 'Reset', 'UnlockConnector', 'TriggerMessage', 'ChangeConfiguration', 'ChangeAvailability', 'SetChargingProfile'],
    };
    return phaseMap[phase] || [];
  }
}
