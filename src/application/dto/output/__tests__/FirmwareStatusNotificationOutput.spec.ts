/**
 * FirmwareStatusNotificationOutput Unit Tests
 * 
 * Tests unitaires pour le DTO de sortie FirmwareStatusNotificationOutput
 * Valide tous les statuts de firmware possibles
 */

import { FirmwareStatusNotificationOutput } from '../FirmwareStatusNotificationOutput';

describe('FirmwareStatusNotificationOutput', () => {
  let output: FirmwareStatusNotificationOutput;

  beforeEach(() => {
    output = new FirmwareStatusNotificationOutput();
  });

  describe('structure', () => {
    it('should have status property', () => {
      expect(output).toHaveProperty('status');
    });
  });

  describe('status', () => {
    it('should support Downloaded status', () => {
      output.status = 'Downloaded';
      expect(output.status).toBe('Downloaded');
    });

    it('should support Downloading status', () => {
      output.status = 'Downloading';
      expect(output.status).toBe('Downloading');
    });

    it('should support Idle status', () => {
      output.status = 'Idle';
      expect(output.status).toBe('Idle');
    });

    it('should support InstallationFailed status', () => {
      output.status = 'InstallationFailed';
      expect(output.status).toBe('InstallationFailed');
    });

    it('should support Installing status', () => {
      output.status = 'Installing';
      expect(output.status).toBe('Installing');
    });

    it('should support Installed status', () => {
      output.status = 'Installed';
      expect(output.status).toBe('Installed');
    });
  });

  describe('complete object', () => {
    it('should create FirmwareStatusNotificationOutput with Downloaded', () => {
      output.status = 'Downloaded';
      expect(output).toEqual({ status: 'Downloaded' });
    });

    it('should create FirmwareStatusNotificationOutput with Downloading', () => {
      output.status = 'Downloading';
      expect(output).toEqual({ status: 'Downloading' });
    });
  });
});
