import { OcppMessageValidator } from '../OcppMessageValidator';
import { BadRequestException } from '@nestjs/common';

describe('OcppMessageValidator', () => {
  let validator: OcppMessageValidator;

  beforeEach(() => {
    validator = new OcppMessageValidator();
  });

  describe('validateOcppMessage', () => {
    it('should accept valid OCPP message', () => {
      const message = [2, 'msg-id-1', 'Authorize', { idTag: 'tag-123' }];
      expect(() => validator.validateOcppMessage(message)).not.toThrow();
    });

    it('should reject non-array message', () => {
      expect(() => validator.validateOcppMessage({ test: 'object' })).toThrow(BadRequestException);
    });

    it('should reject message with less than 3 elements', () => {
      expect(() => validator.validateOcppMessage([2, 'msg-id'])).toThrow(BadRequestException);
    });

    it('should reject invalid messageTypeId', () => {
      expect(() => validator.validateOcppMessage([5, 'msg-id', 'Authorize'])).toThrow(BadRequestException);
    });

    it('should reject empty messageId', () => {
      expect(() => validator.validateOcppMessage([2, '', 'Authorize'])).toThrow(BadRequestException);
    });

    it('should reject non-string messageId', () => {
      expect(() => validator.validateOcppMessage([2, 123, 'Authorize'])).toThrow(BadRequestException);
    });

    it('should reject empty action', () => {
      expect(() => validator.validateOcppMessage([2, 'msg-id', ''])).toThrow(BadRequestException);
    });
  });

  describe('validateChargePointId', () => {
    it('should accept valid charge point ID', () => {
      expect(() => validator.validateChargePointId('CP-001')).not.toThrow();
    });

    it('should reject empty charge point ID', () => {
      expect(() => validator.validateChargePointId('')).toThrow(BadRequestException);
    });

    it('should reject null/undefined charge point ID', () => {
      expect(() => validator.validateChargePointId(null as any)).toThrow(BadRequestException);
    });
  });

  describe('validateTransactionId', () => {
    it('should accept valid transaction ID', () => {
      expect(() => validator.validateTransactionId(123)).not.toThrow();
    });

    it('should reject negative transaction ID', () => {
      expect(() => validator.validateTransactionId(-1)).toThrow(BadRequestException);
    });

    it('should reject non-number transaction ID', () => {
      expect(() => validator.validateTransactionId('123' as any)).toThrow(BadRequestException);
    });
  });
});
