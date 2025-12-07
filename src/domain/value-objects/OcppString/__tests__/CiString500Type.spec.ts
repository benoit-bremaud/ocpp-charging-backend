import {
  createCiString500Type,
  isCiString500Type,
} from '../CiString500Type';

describe('CiString500Type', () => {
  describe('createCiString500Type()', () => {
    it('should create a valid CiString500Type with valid input', () => {
      const value = createCiString500Type('test');
      expect(value).toBe('test');
    });

    it('should accept exactly 500 characters', () => {
      const value = 'a'.repeat(500);
      expect(() => createCiString500Type(value)).not.toThrow();
    });

    it('should reject string exceeding 500 characters', () => {
      const value = 'a'.repeat(501);
      expect(() => createCiString500Type(value)).toThrow(
        /maximum length is 500/
      );
    });

    it('should reject empty string', () => {
      expect(() => createCiString500Type('')).toThrow('must be a non-empty string');
    });

    it('should reject non-string input (null)', () => {
      expect(() => createCiString500Type(null as any)).toThrow('must be a non-empty string');
    });

    it('should reject non-string input (undefined)', () => {
      expect(() => createCiString500Type(undefined as any)).toThrow('must be a non-empty string');
    });

    it('should reject non-string input (number)', () => {
      expect(() => createCiString500Type(123 as any)).toThrow('must be a non-empty string');
    });

    it('should preserve case sensitivity', () => {
      const value = createCiString500Type('TestValue');
      expect(value).toBe('TestValue');
    });

    it('should accept special characters in long string', () => {
      const value = createCiString500Type('test@123!#$%^&*()' + 'x'.repeat(480));
      expect(value.length).toBeLessThanOrEqual(500);
    });

    it('should accept whitespace in very long strings', () => {
      const value = createCiString500Type('test value ' + 'x'.repeat(488));
      expect(value.length).toBeLessThanOrEqual(500);
    });
  });

  describe('isCiString500Type()', () => {
    it('should return true for valid CiString500Type', () => {
      const value = createCiString500Type('test');
      expect(isCiString500Type(value)).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isCiString500Type('')).toBe(false);
    });

    it('should return false for string exceeding 500 characters', () => {
      const value = 'a'.repeat(501);
      expect(isCiString500Type(value)).toBe(false);
    });

    it('should return false for non-string (null)', () => {
      expect(isCiString500Type(null)).toBe(false);
    });

    it('should return false for non-string (undefined)', () => {
      expect(isCiString500Type(undefined)).toBe(false);
    });

    it('should return false for non-string (number)', () => {
      expect(isCiString500Type(123)).toBe(false);
    });

    it('should return false for non-string (object)', () => {
      expect(isCiString500Type({})).toBe(false);
    });

    it('should return true for boundary value (500 chars)', () => {
      const value = 'a'.repeat(500);
      expect(isCiString500Type(value)).toBe(true);
    });
  });
});
