/**
 * CancelReservationOutput Unit Tests
 *
 * Tests unitaires pour le DTO de sortie CancelReservationOutput
 * Valide les statuts d'annulation de réservation
 */

import { CancelReservationOutput } from '../CancelReservationOutput';

describe('CancelReservationOutput', () => {
  let output: CancelReservationOutput;

  beforeEach(() => {
    output = new CancelReservationOutput();
  });

  describe('structure', () => {
    it('should have status property', () => {
      expect(output).toHaveProperty('status');
    });
  });

  describe('status', () => {
    it('should support Accepted status', () => {
      output.status = 'Accepted';
      expect(output.status).toBe('Accepted');
    });

    it('should support Rejected status', () => {
      output.status = 'Rejected';
      expect(output.status).toBe('Rejected');
    });
  });

  describe('complete object', () => {
    it('should create CancelReservationOutput with Accepted', () => {
      output.status = 'Accepted';
      expect(output).toEqual({ status: 'Accepted' });
    });

    it('should create CancelReservationOutput with Rejected', () => {
      output.status = 'Rejected';
      expect(output).toEqual({ status: 'Rejected' });
    });
  });
});
