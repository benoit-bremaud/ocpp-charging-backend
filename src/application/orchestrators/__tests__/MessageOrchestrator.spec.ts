import { MessageOrchestrator } from '../MessageOrchestrator';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('MessageOrchestrator', () => {
  let orchestrator: MessageOrchestrator;
  
  const mockHandlers = {
    bootNotification: { execute: jest.fn().mockResolvedValue({ status: 'Accepted' }) },
    authorize: { execute: jest.fn().mockResolvedValue({ idTagInfo: { status: 'Accepted' } }) },
    heartbeat: { execute: jest.fn().mockResolvedValue({ currentTime: '2025-12-08T01:23:00Z' }) },
    statusNotification: { execute: jest.fn().mockResolvedValue({}) },
    firmwareStatusNotification: { execute: jest.fn().mockResolvedValue({}) },
    diagnosticsStatusNotification: { execute: jest.fn().mockResolvedValue({}) },
    reserveNow: { execute: jest.fn().mockResolvedValue({ status: 'Accepted' }) },
    cancelReservation: { execute: jest.fn().mockResolvedValue({ status: 'Accepted' }) },
    remoteStartTransaction: { execute: jest.fn().mockResolvedValue({ status: 'Accepted' }) },
    remoteStopTransaction: { execute: jest.fn().mockResolvedValue({ status: 'Accepted' }) },
    reset: { execute: jest.fn().mockResolvedValue({ status: 'Accepted' }) },
    unlockConnector: { execute: jest.fn().mockResolvedValue({ status: 'Accepted' }) },
    triggerMessage: { execute: jest.fn().mockResolvedValue({ status: 'Accepted' }) },
    changeConfiguration: { execute: jest.fn().mockResolvedValue({ status: 'Accepted' }) },
    changeAvailability: { execute: jest.fn().mockResolvedValue({ status: 'Accepted' }) },
    setChargingProfile: { execute: jest.fn().mockResolvedValue({ status: 'Accepted' }) },
  };

  beforeEach(() => {
    orchestrator = new MessageOrchestrator(
      mockHandlers.bootNotification as any,
      mockHandlers.authorize as any,
      mockHandlers.heartbeat as any,
      mockHandlers.statusNotification as any,
      mockHandlers.firmwareStatusNotification as any,
      mockHandlers.diagnosticsStatusNotification as any,
      mockHandlers.reserveNow as any,
      mockHandlers.cancelReservation as any,
      mockHandlers.remoteStartTransaction as any,
      mockHandlers.remoteStopTransaction as any,
      mockHandlers.reset as any,
      mockHandlers.unlockConnector as any,
      mockHandlers.triggerMessage as any,
      mockHandlers.changeConfiguration as any,
      mockHandlers.changeAvailability as any,
      mockHandlers.setChargingProfile as any,
    );
  });

  describe('route', () => {
    it('should route BootNotification to correct handler', async () => {
      const result = await orchestrator.route('cp-001', 'BootNotification', {
        chargeBoxSerialNumber: 'SN123',
        chargePointModel: 'Model X',
        chargePointVendor: 'Vendor Y',
        firmwareVersion: '1.0.0'
      });

      expect(mockHandlers.bootNotification.execute).toHaveBeenCalledWith(
        'cp-001',
        expect.objectContaining({ chargePointModel: 'Model X' })
      );
      expect(result).toEqual({ status: 'Accepted' });
    });

    it('should route Authorize to correct handler', async () => {
      const result = await orchestrator.route('cp-001', 'Authorize', { idTag: 'tag-123' });

      expect(mockHandlers.authorize.execute).toHaveBeenCalledWith('cp-001', { idTag: 'tag-123' });
      expect(result.idTagInfo.status).toBe('Accepted');
    });

    it('should route Heartbeat to correct handler', async () => {
      const result = await orchestrator.route('cp-001', 'Heartbeat', {});

      expect(mockHandlers.heartbeat.execute).toHaveBeenCalledWith('cp-001', {});
      expect(result.currentTime).toBeDefined();
    });

    it('should route Phase 6 RemoteStartTransaction to correct handler', async () => {
      const result = await orchestrator.route('cp-001', 'RemoteStartTransaction', { idTag: 'tag-123' });

      expect(mockHandlers.remoteStartTransaction.execute).toHaveBeenCalledWith('cp-001', { idTag: 'tag-123' });
      expect(result.status).toBe('Accepted');
    });

    it('should route Phase 6 RemoteStopTransaction to correct handler', async () => {
      const result = await orchestrator.route('cp-001', 'RemoteStopTransaction', { transactionId: 1 });

      expect(mockHandlers.remoteStopTransaction.execute).toHaveBeenCalledWith('cp-001', { transactionId: 1 });
      expect(result.status).toBe('Accepted');
    });

    it('should route Phase 6 Reset to correct handler', async () => {
      const result = await orchestrator.route('cp-001', 'Reset', { type: 'Hard' });

      expect(mockHandlers.reset.execute).toHaveBeenCalledWith('cp-001', { type: 'Hard' });
      expect(result.status).toBe('Accepted');
    });

    it('should route Phase 6 UnlockConnector to correct handler', async () => {
      const result = await orchestrator.route('cp-001', 'UnlockConnector', { connectorId: 1 });

      expect(mockHandlers.unlockConnector.execute).toHaveBeenCalledWith('cp-001', { connectorId: 1 });
      expect(result.status).toBe('Accepted');
    });

    it('should route Phase 6 TriggerMessage to correct handler', async () => {
      const result = await orchestrator.route('cp-001', 'TriggerMessage', { requestedMessage: 'Heartbeat' });

      expect(mockHandlers.triggerMessage.execute).toHaveBeenCalledWith('cp-001', { requestedMessage: 'Heartbeat' });
      expect(result.status).toBe('Accepted');
    });

    it('should route Phase 6 ChangeConfiguration to correct handler', async () => {
      const result = await orchestrator.route('cp-001', 'ChangeConfiguration', { key: 'HeartbeatInterval', value: '60' });

      expect(mockHandlers.changeConfiguration.execute).toHaveBeenCalledWith('cp-001', expect.objectContaining({ key: 'HeartbeatInterval' }));
      expect(result.status).toBe('Accepted');
    });

    it('should route Phase 6 ChangeAvailability to correct handler', async () => {
      const result = await orchestrator.route('cp-001', 'ChangeAvailability', { connectorId: 1, type: 'Operative' });

      expect(mockHandlers.changeAvailability.execute).toHaveBeenCalledWith('cp-001', expect.objectContaining({ type: 'Operative' }));
      expect(result.status).toBe('Accepted');
    });

    it('should route Phase 6 SetChargingProfile to correct handler', async () => {
      const result = await orchestrator.route('cp-001', 'SetChargingProfile', { connectorId: 1, chargingProfile: {} });

      expect(mockHandlers.setChargingProfile.execute).toHaveBeenCalledWith('cp-001', expect.objectContaining({ connectorId: 1 }));
      expect(result.status).toBe('Accepted');
    });

    it('should throw NotFoundException for unknown action', async () => {
      await expect(
        orchestrator.route('cp-001', 'UnknownAction', {})
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if handler has no execute method', async () => {
      const badOrchestrator = new MessageOrchestrator(
        { notExecute: () => {} } as any,
        mockHandlers.authorize as any,
        mockHandlers.heartbeat as any,
        mockHandlers.statusNotification as any,
        mockHandlers.firmwareStatusNotification as any,
        mockHandlers.diagnosticsStatusNotification as any,
        mockHandlers.reserveNow as any,
        mockHandlers.cancelReservation as any,
        mockHandlers.remoteStartTransaction as any,
        mockHandlers.remoteStopTransaction as any,
        mockHandlers.reset as any,
        mockHandlers.unlockConnector as any,
        mockHandlers.triggerMessage as any,
        mockHandlers.changeConfiguration as any,
        mockHandlers.changeAvailability as any,
        mockHandlers.setChargingProfile as any,
      );

      await expect(
        badOrchestrator.route('cp-001', 'BootNotification', {})
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getSupportedActions', () => {
    it('should return list of all supported actions (Phases 3-6)', () => {
      const actions = orchestrator.getSupportedActions();

      // Phase 3
      expect(actions).toContain('BootNotification');
      expect(actions).toContain('Authorize');
      expect(actions).toContain('Heartbeat');
      
      // Phase 4
      expect(actions).toContain('StatusNotification');
      expect(actions).toContain('FirmwareStatusNotification');
      expect(actions).toContain('DiagnosticsStatusNotification');
      
      // Phase 5
      expect(actions).toContain('ReserveNow');
      expect(actions).toContain('CancelReservation');
      
      // Phase 6
      expect(actions).toContain('RemoteStartTransaction');
      expect(actions).toContain('RemoteStopTransaction');
      expect(actions).toContain('Reset');
      expect(actions).toContain('UnlockConnector');
      expect(actions).toContain('TriggerMessage');
      expect(actions).toContain('ChangeConfiguration');
      expect(actions).toContain('ChangeAvailability');
      expect(actions).toContain('SetChargingProfile');
      
      expect(actions).toHaveLength(16);
    });
  });

  describe('isActionSupported', () => {
    it('should return true for Phase 3-5 supported actions', () => {
      expect(orchestrator.isActionSupported('BootNotification')).toBe(true);
      expect(orchestrator.isActionSupported('Authorize')).toBe(true);
      expect(orchestrator.isActionSupported('Heartbeat')).toBe(true);
      expect(orchestrator.isActionSupported('ReserveNow')).toBe(true);
      expect(orchestrator.isActionSupported('CancelReservation')).toBe(true);
    });

    it('should return true for Phase 6 supported actions', () => {
      expect(orchestrator.isActionSupported('RemoteStartTransaction')).toBe(true);
      expect(orchestrator.isActionSupported('RemoteStopTransaction')).toBe(true);
      expect(orchestrator.isActionSupported('Reset')).toBe(true);
      expect(orchestrator.isActionSupported('UnlockConnector')).toBe(true);
      expect(orchestrator.isActionSupported('TriggerMessage')).toBe(true);
      expect(orchestrator.isActionSupported('ChangeConfiguration')).toBe(true);
      expect(orchestrator.isActionSupported('ChangeAvailability')).toBe(true);
      expect(orchestrator.isActionSupported('SetChargingProfile')).toBe(true);
    });

    it('should return false for unsupported actions', () => {
      expect(orchestrator.isActionSupported('UnknownAction')).toBe(false);
      expect(orchestrator.isActionSupported('InvalidHandler')).toBe(false);
    });
  });

  describe('getHandlersByPhase', () => {
    it('should return handlers for Phase 3', () => {
      const phase3Handlers = orchestrator.getHandlersByPhase(3);
      expect(phase3Handlers).toEqual(['BootNotification', 'Authorize', 'Heartbeat']);
    });

    it('should return handlers for Phase 6', () => {
      const phase6Handlers = orchestrator.getHandlersByPhase(6);
      expect(phase6Handlers).toEqual([
        'RemoteStartTransaction',
        'RemoteStopTransaction',
        'Reset',
        'UnlockConnector',
        'TriggerMessage',
        'ChangeConfiguration',
        'ChangeAvailability',
        'SetChargingProfile',
      ]);
    });
  });
});
