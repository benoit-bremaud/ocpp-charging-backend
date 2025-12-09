import { createCiString25Type, isCiString25Type } from '../CiString25Type';

describe('CiString25Type', () => {
  describe('createCiString25Type()', () => {
    it('should create a valid CiString25Type with valid input', () => {
      const value = createCiString25Type('test');
      expect(value).toBe('test');
    });

    it('should accept exactly 25 characters', () => {
      const value = 'a'.repeat(25);
      expect(() => createCiString25Type(value)).not.toThrow();
    });

    it('should reject string exceeding 25 characters', () => {
      const value = 'a'.repeat(26);
      expect(() => createCiString25Type(value)).toThrow(/maximum length is 25/);
    });

    it('should reject empty string', () => {
      expect(() => createCiString25Type('')).toThrow('must be a non-empty string');
    });

    it('should reject non-string input (null)', () => {
      expect(() => createCiString25Type(null as any)).toThrow('must be a non-empty string');
    });

    it('should reject non-string input (undefined)', () => {
      expect(() => createCiString25Type(undefined as any)).toThrow('must be a non-empty string');
    });

    it('should reject non-string input (number)', () => {
      expect(() => createCiString25Type(123 as any)).toThrow('must be a non-empty string');
    });

    it('should preserve case sensitivity', () => {
      const value = createCiString25Type('TestValue');
      expect(value).toBe('TestValue');
    });

    it('should accept special characters', () => {
      const value = createCiString25Type('test@123!');
      expect(value).toBe('test@123!');
    });

    it('should accept whitespace', () => {
      const value = createCiString25Type('test value test');
      expect(value).toBe('test value test');
    });
  });

  describe('isCiString25Type()', () => {
    it('should return true for valid CiString25Type', () => {
      const value = createCiString25Type('test');
      expect(isCiString25Type(value)).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isCiString25Type('')).toBe(false);
    });

    it('should return false for string exceeding 25 characters', () => {
      const value = 'a'.repeat(26);
      expect(isCiString25Type(value)).toBe(false);
    });

    it('should return false for non-string (null)', () => {
      expect(isCiString25Type(null)).toBe(false);
    });

    it('should return false for non-string (undefined)', () => {
      expect(isCiString25Type(undefined)).toBe(false);
    });

    it('should return false for non-string (number)', () => {
      expect(isCiString25Type(123)).toBe(false);
    });

    it('should return false for non-string (object)', () => {
      expect(isCiString25Type({})).toBe(false);
    });

    it('should return true for boundary value (25 chars)', () => {
      const value = 'a'.repeat(25);
      expect(isCiString25Type(value)).toBe(true);
    });
  });
});
