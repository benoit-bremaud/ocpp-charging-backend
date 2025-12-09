import { createCiString20Type, isCiString20Type } from '../CiString20Type';

describe('CiString20Type', () => {
  describe('createCiString20Type()', () => {
    it('should create a valid CiString20Type with valid input', () => {
      const value = createCiString20Type('test');
      expect(value).toBe('test');
    });

    it('should accept exactly 20 characters', () => {
      const value = 'a'.repeat(20);
      expect(() => createCiString20Type(value)).not.toThrow();
    });

    it('should reject string exceeding 20 characters', () => {
      const value = 'a'.repeat(21);
      expect(() => createCiString20Type(value)).toThrow(/maximum length is 20/);
    });

    it('should reject empty string', () => {
      expect(() => createCiString20Type('')).toThrow('must be a non-empty string');
    });

    it('should reject non-string input (null)', () => {
      expect(() => createCiString20Type(null as any)).toThrow('must be a non-empty string');
    });

    it('should reject non-string input (undefined)', () => {
      expect(() => createCiString20Type(undefined as any)).toThrow('must be a non-empty string');
    });

    it('should reject non-string input (number)', () => {
      expect(() => createCiString20Type(123 as any)).toThrow('must be a non-empty string');
    });

    it('should preserve case sensitivity', () => {
      const value = createCiString20Type('TestValue');
      expect(value).toBe('TestValue');
    });

    it('should accept special characters', () => {
      const value = createCiString20Type('test@123!');
      expect(value).toBe('test@123!');
    });

    it('should accept whitespace', () => {
      const value = createCiString20Type('test value');
      expect(value).toBe('test value');
    });
  });

  describe('isCiString20Type()', () => {
    it('should return true for valid CiString20Type', () => {
      const value = createCiString20Type('test');
      expect(isCiString20Type(value)).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isCiString20Type('')).toBe(false);
    });

    it('should return false for string exceeding 20 characters', () => {
      const value = 'a'.repeat(21);
      expect(isCiString20Type(value)).toBe(false);
    });

    it('should return false for non-string (null)', () => {
      expect(isCiString20Type(null)).toBe(false);
    });

    it('should return false for non-string (undefined)', () => {
      expect(isCiString20Type(undefined)).toBe(false);
    });

    it('should return false for non-string (number)', () => {
      expect(isCiString20Type(123)).toBe(false);
    });

    it('should return false for non-string (object)', () => {
      expect(isCiString20Type({})).toBe(false);
    });

    it('should return true for boundary value (20 chars)', () => {
      const value = 'a'.repeat(20);
      expect(isCiString20Type(value)).toBe(true);
    });
  });
});
