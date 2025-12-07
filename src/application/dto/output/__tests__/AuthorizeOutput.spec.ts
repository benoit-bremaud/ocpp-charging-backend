/**
 * AuthorizeOutput Unit Tests
 * 
 * Tests unitaires pour le DTO de sortie AuthorizeOutput
 * Valide la structure idTokenInfo et tous les statuts possibles
 */

import { AuthorizeOutput } from '../AuthorizeOutput';

describe('AuthorizeOutput', () => {
  let output: AuthorizeOutput;

  beforeEach(() => {
    output = new AuthorizeOutput();
  });

  describe('structure', () => {
    it('should have idTokenInfo property', () => {
      expect(output).toBeDefined();
      output.idTokenInfo = {
        status: 'Accepted'
      };
      expect(output.idTokenInfo).toBeDefined();
    });

    it('should have idTokenInfo with required status', () => {
      output.idTokenInfo = {
        status: 'Accepted'
      };
      expect(output.idTokenInfo.status).toBe('Accepted');
    });
  });

  describe('status types', () => {
    it('should accept Accepted status', () => {
      output.idTokenInfo = {
        status: 'Accepted'
      };
      expect(output.idTokenInfo.status).toBe('Accepted');
    });

    it('should accept Blocked status', () => {
      output.idTokenInfo = {
        status: 'Blocked'
      };
      expect(output.idTokenInfo.status).toBe('Blocked');
    });

    it('should accept Expired status', () => {
      output.idTokenInfo = {
        status: 'Expired'
      };
      expect(output.idTokenInfo.status).toBe('Expired');
    });

    it('should accept Invalid status', () => {
      output.idTokenInfo = {
        status: 'Invalid'
      };
      expect(output.idTokenInfo.status).toBe('Invalid');
    });

    it('should accept ConcurrentTx status', () => {
      output.idTokenInfo = {
        status: 'ConcurrentTx'
      };
      expect(output.idTokenInfo.status).toBe('ConcurrentTx');
    });
  });

  describe('optional properties', () => {
    it('should assign expiryDate when provided', () => {
      output.idTokenInfo = {
        status: 'Accepted',
        expiryDate: '2025-12-31T23:59:59Z'
      };
      expect(output.idTokenInfo.expiryDate).toBe('2025-12-31T23:59:59Z');
    });

    it('should assign parentIdTag when provided', () => {
      output.idTokenInfo = {
        status: 'Accepted',
        parentIdTag: 'PARENT-TAG'
      };
      expect(output.idTokenInfo.parentIdTag).toBe('PARENT-TAG');
    });

    it('should support both expiryDate and parentIdTag', () => {
      output.idTokenInfo = {
        status: 'Accepted',
        expiryDate: '2025-12-31T23:59:59Z',
        parentIdTag: 'PARENT-TAG'
      };
      expect(output.idTokenInfo.expiryDate).toBe('2025-12-31T23:59:59Z');
      expect(output.idTokenInfo.parentIdTag).toBe('PARENT-TAG');
    });
  });

  describe('complete object', () => {
    it('should create complete AuthorizeOutput with all properties', () => {
      output.idTokenInfo = {
        status: 'Accepted',
        expiryDate: '2025-12-31T23:59:59Z',
        parentIdTag: 'PARENT-TAG'
      };

      expect(output).toEqual({
        idTokenInfo: {
          status: 'Accepted',
          expiryDate: '2025-12-31T23:59:59Z',
          parentIdTag: 'PARENT-TAG'
        }
      });
    });

    it('should create AuthorizeOutput with minimal properties', () => {
      output.idTokenInfo = {
        status: 'Blocked'
      };

      expect(output.idTokenInfo.status).toBe('Blocked');
      expect(output.idTokenInfo.expiryDate).toBeUndefined();
      expect(output.idTokenInfo.parentIdTag).toBeUndefined();
    });

    it('should handle blocked token without expiry or parent tag', () => {
      output.idTokenInfo = {
        status: 'Blocked'
      };

      expect(output).toBeDefined();
      expect(output.idTokenInfo.status).toBe('Blocked');
    });

    it('should handle expired token with expiry date', () => {
      output.idTokenInfo = {
        status: 'Expired',
        expiryDate: '2024-01-01T00:00:00Z'
      };

      expect(output.idTokenInfo.status).toBe('Expired');
      expect(output.idTokenInfo.expiryDate).toBe('2024-01-01T00:00:00Z');
    });
  });
});
