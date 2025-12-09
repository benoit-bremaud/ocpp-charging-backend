/**
 * ChargePointOutput Unit Tests
 *
 * Tests unitaires pour le DTO de sortie ChargePointOutput
 * Valide la structure, les types et les propriétés optionnelles
 */

import { ChargePointOutput } from '../ChargePointOutput';

describe('ChargePointOutput', () => {
  let output: ChargePointOutput;

  beforeEach(() => {
    output = new ChargePointOutput();
  });

  describe('structure', () => {
    it('should have required properties initialized', () => {
      expect(output.id).toBe('');
      expect(output.chargePointId).toBe('');
      expect(output.model).toBe('');
      expect(output.vendor).toBe('');
    });
  });

  describe('assignments', () => {
    it('should assign id correctly', () => {
      output.id = 'cp-001';
      expect(output.id).toBe('cp-001');
    });

    it('should assign chargePointId correctly', () => {
      output.chargePointId = 'ABC-123';
      expect(output.chargePointId).toBe('ABC-123');
    });

    it('should assign model correctly', () => {
      output.model = 'Model X';
      expect(output.model).toBe('Model X');
    });

    it('should assign vendor correctly', () => {
      output.vendor = 'VendorY';
      expect(output.vendor).toBe('VendorY');
    });

    it('should assign firmwareVersion when provided', () => {
      output.firmwareVersion = '1.2.3';
      expect(output.firmwareVersion).toBe('1.2.3');
    });

    it('should assign serialNumber when provided', () => {
      output.serialNumber = 'SN-12345';
      expect(output.serialNumber).toBe('SN-12345');
    });
  });

  describe('complete object', () => {
    it('should create complete ChargePointOutput', () => {
      output.id = 'cp-001';
      output.chargePointId = 'ABC-123';
      output.model = 'Model X';
      output.vendor = 'VendorY';
      output.firmwareVersion = '1.2.3';
      output.serialNumber = 'SN-12345';

      expect(output).toEqual({
        id: 'cp-001',
        chargePointId: 'ABC-123',
        model: 'Model X',
        vendor: 'VendorY',
        firmwareVersion: '1.2.3',
        serialNumber: 'SN-12345',
      });
    });

    it('should create ChargePointOutput without optional fields', () => {
      output.id = 'cp-001';
      output.chargePointId = 'ABC-123';
      output.model = 'Model X';
      output.vendor = 'VendorY';

      expect(output.id).toBe('cp-001');
      expect(output.chargePointId).toBe('ABC-123');
      expect(output.firmwareVersion).toBeUndefined();
      expect(output.serialNumber).toBeUndefined();
    });
  });
});
