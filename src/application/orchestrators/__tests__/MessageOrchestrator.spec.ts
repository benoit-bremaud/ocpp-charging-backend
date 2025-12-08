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
    cancelReservation: { execute: jest.fn().mockResolvedValue({ status: 'Accepted' }) }
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
      mockHandlers.cancelReservation as any
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
        mockHandlers.cancelReservation as any
      );

      await expect(
        badOrchestrator.route('cp-001', 'BootNotification', {})
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getSupportedActions', () => {
    it('should return list of all supported actions', () => {
      const actions = orchestrator.getSupportedActions();

      expect(actions).toContain('BootNotification');
      expect(actions).toContain('Authorize');
      expect(actions).toContain('Heartbeat');
      expect(actions).toContain('StatusNotification');
      expect(actions).toContain('FirmwareStatusNotification');
      expect(actions).toContain('DiagnosticsStatusNotification');
      expect(actions).toContain('ReserveNow');
      expect(actions).toContain('CancelReservation');
      expect(actions).toHaveLength(8);
    });
  });

  describe('isActionSupported', () => {
    it('should return true for supported actions', () => {
      expect(orchestrator.isActionSupported('BootNotification')).toBe(true);
      expect(orchestrator.isActionSupported('Authorize')).toBe(true);
      expect(orchestrator.isActionSupported('Heartbeat')).toBe(true);
    });

    it('should return false for unsupported actions', () => {
      expect(orchestrator.isActionSupported('UnknownAction')).toBe(false);
      expect(orchestrator.isActionSupported('InvalidHandler')).toBe(false);
    });
  });
});
