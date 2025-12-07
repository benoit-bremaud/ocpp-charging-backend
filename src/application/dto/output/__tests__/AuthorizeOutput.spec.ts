/**
 * AuthorizeOutput Unit Tests
 * 
 * Tests unitaires pour le DTO de sortie AuthorizeOutput
 * Valide idTokenInfo et tous les statuts d'autorisation
 */

import { AuthorizeOutput } from '../AuthorizeOutput';

describe('AuthorizeOutput', () => {
  let output: AuthorizeOutput;

  beforeEach(() => {
    output = new AuthorizeOutput();
  });

  describe('structure', () => {
    it('should have idTokenInfo property', () => {
      expect(output).toHaveProperty('idTokenInfo');
    });
  });

  describe('idTokenInfo.status', () => {
    it('should support Accepted status', () => {
      output.idTokenInfo = { status: 'Accepted' };
      expect(output.idTokenInfo.status).toBe('Accepted');
    });

    it('should support Blocked status', () => {
      output.idTokenInfo = { status: 'Blocked' };
      expect(output.idTokenInfo.status).toBe('Blocked');
    });

    it('should support Expired status', () => {
      output.idTokenInfo = { status: 'Expired' };
      expect(output.idTokenInfo.status).toBe('Expired');
    });

    it('should support Invalid status', () => {
      output.idTokenInfo = { status: 'Invalid' };
      expect(output.idTokenInfo.status).toBe('Invalid');
    });

    it('should support ConcurrentTx status', () => {
      output.idTokenInfo = { status: 'ConcurrentTx' };
      expect(output.idTokenInfo.status).toBe('ConcurrentTx');
    });
  });

  describe('idTokenInfo.expiryDate', () => {
    it('should allow expiryDate assignment', () => {
      output.idTokenInfo = {
        status: 'Accepted',
        expiryDate: '2025-12-31T23:59:59Z',
      };
      expect(output.idTokenInfo.expiryDate).toBe('2025-12-31T23:59:59Z');
    });

    it('should be optional', () => {
      output.idTokenInfo = { status: 'Accepted' };
      expect(output.idTokenInfo.expiryDate).toBeUndefined();
    });
  });

  describe('idTokenInfo.parentIdTag', () => {
    it('should allow parentIdTag assignment', () => {
      output.idTokenInfo = {
        status: 'Accepted',
        parentIdTag: 'parent-id-123',
      };
      expect(output.idTokenInfo.parentIdTag).toBe('parent-id-123');
    });

    it('should be optional', () => {
      output.idTokenInfo = { status: 'Blocked' };
      expect(output.idTokenInfo.parentIdTag).toBeUndefined();
    });
  });

  describe('complete object', () => {
    it('should create complete idTokenInfo', () => {\n      output.idTokenInfo = {
        status: 'Accepted',
        expiryDate: '2025-12-31T23:59:59Z',
        parentIdTag: 'parent-id-123',
      };

      expect(output.idTokenInfo).toEqual({
        status: 'Accepted',
        expiryDate: '2025-12-31T23:59:59Z',
        parentIdTag: 'parent-id-123',
      });
    });

    it('should create idTokenInfo with only required field', () => {
      output.idTokenInfo = { status: 'Expired' };

      expect(output.idTokenInfo).toEqual({ status: 'Expired' });
    });
  });
});
