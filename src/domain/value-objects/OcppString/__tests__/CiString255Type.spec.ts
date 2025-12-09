import { createCiString255Type, isCiString255Type } from '../CiString255Type';

describe('CiString255Type', () => {
  describe('createCiString255Type()', () => {
    it('should create a valid CiString255Type with valid input', () => {
      const value = createCiString255Type('test');
      expect(value).toBe('test');
    });

    it('should accept exactly 255 characters', () => {
      const value = 'a'.repeat(255);
      expect(() => createCiString255Type(value)).not.toThrow();
    });

    it('should reject string exceeding 255 characters', () => {
      const value = 'a'.repeat(256);
      expect(() => createCiString255Type(value)).toThrow(/maximum length is 255/);
    });

    it('should reject empty string', () => {
      expect(() => createCiString255Type('')).toThrow('must be a non-empty string');
    });

    it('should reject non-string input (null)', () => {
      expect(() => createCiString255Type(null as any)).toThrow('must be a non-empty string');
    });

    it('should reject non-string input (undefined)', () => {
      expect(() => createCiString255Type(undefined as any)).toThrow('must be a non-empty string');
    });

    it('should reject non-string input (number)', () => {
      expect(() => createCiString255Type(123 as any)).toThrow('must be a non-empty string');
    });

    it('should preserve case sensitivity', () => {
      const value = createCiString255Type('TestValue');
      expect(value).toBe('TestValue');
    });

    it('should accept special characters', () => {
      const value = createCiString255Type('test@123!#$%^&*()');
      expect(value).toBe('test@123!#$%^&*()');
    });

    it('should accept whitespace in long strings', () => {
      const value = createCiString255Type('test value ' + 'x'.repeat(240));
      expect(value.length).toBeLessThanOrEqual(255);
    });
  });

  describe('isCiString255Type()', () => {
    it('should return true for valid CiString255Type', () => {
      const value = createCiString255Type('test');
      expect(isCiString255Type(value)).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isCiString255Type('')).toBe(false);
    });

    it('should return false for string exceeding 255 characters', () => {
      const value = 'a'.repeat(256);
      expect(isCiString255Type(value)).toBe(false);
    });

    it('should return false for non-string (null)', () => {
      expect(isCiString255Type(null)).toBe(false);
    });

    it('should return false for non-string (undefined)', () => {
      expect(isCiString255Type(undefined)).toBe(false);
    });

    it('should return false for non-string (number)', () => {
      expect(isCiString255Type(123)).toBe(false);
    });

    it('should return false for non-string (object)', () => {
      expect(isCiString255Type({})).toBe(false);
    });

    it('should return true for boundary value (255 chars)', () => {
      const value = 'a'.repeat(255);
      expect(isCiString255Type(value)).toBe(true);
    });
  });
});
