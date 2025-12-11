import { AuthorizationStatus } from '@/domain/enums/auth/AuthorizationStatus';

describe('Domain › Enums › Auth › AuthorizationStatus', () => {
  describe('enum values', () => {
    it('should have Accepted value', () => {
      expect(AuthorizationStatus.Accepted).toBe('Accepted');
    });

    it('should have Blocked value', () => {
      expect(AuthorizationStatus.Blocked).toBe('Blocked');
    });

    it('should have Expired value', () => {
      expect(AuthorizationStatus.Expired).toBe('Expired');
    });

    it('should have Invalid value', () => {
      expect(AuthorizationStatus.Invalid).toBe('Invalid');
    });

    it('should have ConcurrentTx value', () => {
      expect(AuthorizationStatus.ConcurrentTx).toBe('ConcurrentTx');
    });
  });

  describe('enum integrity', () => {
    it('should have exactly 5 enum values', () => {
      const values = Object.values(AuthorizationStatus);
      expect(values).toHaveLength(5);
    });

    it('should have all values as strings', () => {
      const values = Object.values(AuthorizationStatus);
      expect(values.every((v) => typeof v === 'string')).toBe(true);
    });
  });
});
