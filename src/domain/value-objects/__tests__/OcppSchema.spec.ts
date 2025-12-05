import { OcppSchema } from '../OcppSchema';

describe('OcppSchema - OCPP 1.6 JSON Schema Validator', () => {
  describe('Heartbeat validation', () => {
    it('should accept empty payload', () => {
      const result = OcppSchema.validate('Heartbeat', {});
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject payload with additional properties', () => {
      const result = OcppSchema.validate('Heartbeat', {
        extraField: 'not allowed',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('Additional property not allowed'),
      );
    });
  });

  describe('BootNotification validation', () => {
    it('should accept valid BootNotification', () => {
      const payload = {
        chargePointModel: 'Tesla Supercharger v3',
        chargePointVendor: 'Tesla Inc',
      };
      const result = OcppSchema.validate('BootNotification', payload);
      expect(result.valid).toBe(true);
    });

    it('should reject missing required fields', () => {
      const payload = {
        chargePointModel: 'Tesla',
        // missing chargePointVendor
      };
      const result = OcppSchema.validate('BootNotification', payload);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Missing required field: chargePointVendor',
      );
    });

    it('should reject string exceeding max length', () => {
      const payload = {
        chargePointModel: 'A'.repeat(51), // Max 50
        chargePointVendor: 'Tesla',
      };
      const result = OcppSchema.validate('BootNotification', payload);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('exceeds max length'),
      );
    });
  });

  describe('StatusNotification validation', () => {
    it('should accept valid StatusNotification', () => {
      const payload = {
        connectorId: 1,
        errorCode: 'NoError',
        status: 'Available',
        timestamp: '2025-12-05T16:11:02Z',
      };
      const result = OcppSchema.validate('StatusNotification', payload);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid enum value', () => {
      const payload = {
        connectorId: 1,
        errorCode: 'InvalidCode',
        status: 'Available',
        timestamp: '2025-12-05T16:11:02Z',
      };
      const result = OcppSchema.validate('StatusNotification', payload);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('must be one of'),
      );
    });

    it('should reject invalid timestamp format', () => {
      const payload = {
        connectorId: 1,
        errorCode: 'NoError',
        status: 'Available',
        timestamp: '2025/12/05', // Not ISO 8601
      };
      const result = OcppSchema.validate('StatusNotification', payload);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('ISO 8601'),
      );
    });
  });

  describe('Unknown action', () => {
    it('should handle unknown action gracefully', () => {
      const result = OcppSchema.validate('UnknownAction', {});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'No schema defined for action: UnknownAction',
      );
    });
  });
});
