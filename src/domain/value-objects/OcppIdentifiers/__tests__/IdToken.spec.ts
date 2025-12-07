import {
  createIdToken,
  isIdToken,
} from '../IdToken';

describe('IdToken', () => {
  describe('createIdToken()', () => {
    it('should create a valid IdToken with valid input', () => {
      const token = createIdToken('ABC123');
      expect(token).toBe('ABC123');
    });

    it('should accept exactly 20 characters', () => {
      const token = 'a'.repeat(20);
      expect(() => createIdToken(token)).not.toThrow();
    });

    it('should reject token exceeding 20 characters', () => {
      const token = 'a'.repeat(21);
      expect(() => createIdToken(token)).toThrow(
        /maximum length is 20/
      );
    });

    it('should reject empty token', () => {
      expect(() => createIdToken('')).toThrow('must be a non-empty string');
    });

    it('should reject non-string input (null)', () => {
      expect(() => createIdToken(null as any)).toThrow('must be a non-empty string');
    });

    it('should reject non-string input (undefined)', () => {
      expect(() => createIdToken(undefined as any)).toThrow('must be a non-empty string');
    });

    it('should reject non-string input (number)', () => {
      expect(() => createIdToken(123 as any)).toThrow('must be a non-empty string');
    });

    it('should accept alphanumeric characters', () => {
      const token = createIdToken('TOKEN123ABC');
      expect(token).toBe('TOKEN123ABC');
    });

    it('should accept special characters', () => {
      const token = createIdToken('TOKEN-123_ABC');
      expect(token).toBe('TOKEN-123_ABC');
    });

    it('should preserve case sensitivity', () => {
      const token = createIdToken('MyIdToken1234');
      expect(token).toBe('MyIdToken1234');
    });
  });

  describe('isIdToken()', () => {
    it('should return true for valid IdToken', () => {
      const token = createIdToken('ABC123');
      expect(isIdToken(token)).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isIdToken('')).toBe(false);
    });

    it('should return false for token exceeding 20 characters', () => {
      const token = 'a'.repeat(21);
      expect(isIdToken(token)).toBe(false);
    });

    it('should return false for non-string (null)', () => {
      expect(isIdToken(null)).toBe(false);
    });

    it('should return false for non-string (undefined)', () => {
      expect(isIdToken(undefined)).toBe(false);
    });

    it('should return false for non-string (number)', () => {
      expect(isIdToken(123)).toBe(false);
    });

    it('should return false for non-string (object)', () => {
      expect(isIdToken({})).toBe(false);
    });

    it('should return true for boundary value (20 chars)', () => {
      const token = 'a'.repeat(20);
      expect(isIdToken(token)).toBe(true);
    });

    it('should return true for alphanumeric token', () => {
      const token = createIdToken('TOKEN123ABC');
      expect(isIdToken(token)).toBe(true);
    });
  });
});
