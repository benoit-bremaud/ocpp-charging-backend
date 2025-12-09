/**
 * DiagnosticsStatusNotificationOutput Unit Tests
 *
 * Tests unitaires pour le DTO de sortie DiagnosticsStatusNotificationOutput
 * Valide tous les statuts de diagnostic possibles
 */

import { DiagnosticsStatusNotificationOutput } from '../DiagnosticsStatusNotificationOutput';

describe('DiagnosticsStatusNotificationOutput', () => {
  let output: DiagnosticsStatusNotificationOutput;

  beforeEach(() => {
    output = new DiagnosticsStatusNotificationOutput();
  });

  describe('structure', () => {
    it('should have status property', () => {
      expect(output).toHaveProperty('status');
    });
  });

  describe('status', () => {
    it('should support Idle status', () => {
      output.status = 'Idle';
      expect(output.status).toBe('Idle');
    });

    it('should support Uploading status', () => {
      output.status = 'Uploading';
      expect(output.status).toBe('Uploading');
    });

    it('should support UploadFailed status', () => {
      output.status = 'UploadFailed';
      expect(output.status).toBe('UploadFailed');
    });
  });

  describe('complete object', () => {
    it('should create DiagnosticsStatusNotificationOutput with Idle', () => {
      output.status = 'Idle';
      expect(output).toEqual({ status: 'Idle' });
    });

    it('should create DiagnosticsStatusNotificationOutput with Uploading', () => {
      output.status = 'Uploading';
      expect(output).toEqual({ status: 'Uploading' });
    });

    it('should create DiagnosticsStatusNotificationOutput with UploadFailed', () => {
      output.status = 'UploadFailed';
      expect(output).toEqual({ status: 'UploadFailed' });
    });
  });
});
