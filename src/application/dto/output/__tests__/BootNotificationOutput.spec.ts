/**
 * BootNotificationOutput Unit Tests
 *
 * Tests unitaires pour le DTO de sortie BootNotificationOutput
 * Valide status, currentTime et interval
 */

import { BootNotificationOutput } from '../BootNotificationOutput';

describe('BootNotificationOutput', () => {
  let output: BootNotificationOutput;

  beforeEach(() => {
    output = new BootNotificationOutput();
  });

  describe('structure', () => {
    it('should have required properties', () => {
      expect(output).toHaveProperty('status');
      expect(output).toHaveProperty('currentTime');
      expect(output).toHaveProperty('interval');
    });
  });

  describe('status', () => {
    it('should support Accepted status', () => {
      output.status = 'Accepted';
      expect(output.status).toBe('Accepted');
    });

    it('should support Pending status', () => {
      output.status = 'Pending';
      expect(output.status).toBe('Pending');
    });

    it('should support Rejected status', () => {
      output.status = 'Rejected';
      expect(output.status).toBe('Rejected');
    });
  });

  describe('currentTime', () => {
    it('should assign ISO timestamp', () => {
      const isoTime = new Date().toISOString();
      output.currentTime = isoTime;
      expect(output.currentTime).toBe(isoTime);
    });

    it('should accept various ISO formats', () => {
      const isoTime = '2025-12-08T12:00:00Z';
      output.currentTime = isoTime;
      expect(output.currentTime).toBe(isoTime);
    });
  });

  describe('interval', () => {
    it('should assign interval number', () => {
      output.interval = 900;
      expect(output.interval).toBe(900);
    });

    it('should support default interval value', () => {
      output.interval = 900;
      expect(output.interval).toBe(900);
    });

    it('should support custom interval values', () => {
      output.interval = 300;
      expect(output.interval).toBe(300);
    });
  });

  describe('complete object', () => {
    it('should create complete BootNotificationOutput', () => {
      const now = new Date().toISOString();
      output.status = 'Accepted';
      output.currentTime = now;
      output.interval = 900;

      expect(output).toEqual({
        status: 'Accepted',
        currentTime: now,
        interval: 900,
      });
    });
  });
});
