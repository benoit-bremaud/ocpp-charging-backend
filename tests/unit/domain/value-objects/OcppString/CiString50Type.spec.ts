import { createCiString50Type, isCiString50Type } from '@/domain/value-objects/OcppString/CiString50Type';

describe('CiString50Type', () => {
  describe('createCiString50Type()', () => {
    it('should create a valid CiString50Type with valid input', () => {
      const value = createCiString50Type('test');
      expect(value).toBe('test');
    });

    it('should accept exactly 50 characters', () => {
      const value = 'a'.repeat(50);
      expect(() => createCiString50Type(value)).not.toThrow();
    });

    it('should reject string exceeding 50 characters', () => {
      const value = 'a'.repeat(51);
      expect(() => createCiString50Type(value)).toThrow(/maximum length is 50/);
    });

    it('should reject empty string', () => {
      expect(() => createCiString50Type('')).toThrow('must be a non-empty string');
    });

    it('should reject non-string input (null)', () => {
      expect(() => createCiString50Type(null as any)).toThrow('must be a non-empty string');
    });

    it('should reject non-string input (undefined)', () => {
      expect(() => createCiString50Type(undefined as any)).toThrow('must be a non-empty string');
    });

    it('should reject non-string input (number)', () => {
      expect(() => createCiString50Type(123 as any)).toThrow('must be a non-empty string');
    });

    it('should preserve case sensitivity', () => {
      const value = createCiString50Type('TestValue');
      expect(value).toBe('TestValue');
    });

    it('should accept special characters', () => {
      const value = createCiString50Type('test@123!#$%');
      expect(value).toBe('test@123!#$%');
    });

    it('should accept whitespace', () => {
      const value = createCiString50Type('test value with spaces');
      expect(value).toBe('test value with spaces');
    });
  });

  describe('isCiString50Type()', () => {
    it('should return true for valid CiString50Type', () => {
      const value = createCiString50Type('test');
      expect(isCiString50Type(value)).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isCiString50Type('')).toBe(false);
    });

    it('should return false for string exceeding 50 characters', () => {
      const value = 'a'.repeat(51);
      expect(isCiString50Type(value)).toBe(false);
    });

    it('should return false for non-string (null)', () => {
      expect(isCiString50Type(null)).toBe(false);
    });

    it('should return false for non-string (undefined)', () => {
      expect(isCiString50Type(undefined)).toBe(false);
    });

    it('should return false for non-string (number)', () => {
      expect(isCiString50Type(123)).toBe(false);
    });

    it('should return false for non-string (object)', () => {
      expect(isCiString50Type({})).toBe(false);
    });

    it('should return true for boundary value (50 chars)', () => {
      const value = 'a'.repeat(50);
      expect(isCiString50Type(value)).toBe(true);
    });
  });
});
