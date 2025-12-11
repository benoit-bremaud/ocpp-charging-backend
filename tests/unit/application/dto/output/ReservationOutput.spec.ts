/**
 * ReservationOutput Unit Tests
 *
 * Tests unitaires pour le DTO de sortie ReservationOutput
 * Valide la structure et les statuts de réservation
 */

import { ReservationOutput } from '@/application/dto/output/ReservationOutput';

describe('ReservationOutput', () => {
  let output: ReservationOutput;

  beforeEach(() => {
    output = new ReservationOutput();
  });

  describe('structure', () => {
    it('should have status property', () => {
      output.status = 'Accepted';
      expect(output.status).toBe('Accepted');
    });
  });

  describe('status types', () => {
    it('should support Accepted status', () => {
      output.status = 'Accepted';
      expect(output.status).toBe('Accepted');
    });

    it('should support Faulted status', () => {
      output.status = 'Faulted';
      expect(output.status).toBe('Faulted');
    });

    it('should support Occupied status', () => {
      output.status = 'Occupied';
      expect(output.status).toBe('Occupied');
    });

    it('should support Rejected status', () => {
      output.status = 'Rejected';
      expect(output.status).toBe('Rejected');
    });

    it('should support Unavailable status', () => {
      output.status = 'Unavailable';
      expect(output.status).toBe('Unavailable');
    });
  });

  describe('reservationId', () => {
    it('should assign reservationId when provided', () => {
      output.status = 'Accepted';
      output.reservationId = 12345;
      expect(output.reservationId).toBe(12345);
    });

    it('should be optional', () => {
      output.status = 'Rejected';
      expect(output.reservationId).toBeUndefined();
    });

    it('should support zero as reservationId', () => {
      output.status = 'Accepted';
      output.reservationId = 0;
      expect(output.reservationId).toBe(0);
    });
  });

  describe('complete object', () => {
    it('should create ReservationOutput with reservationId', () => {
      output.status = 'Accepted';
      output.reservationId = 12345;

      expect(output).toEqual({
        status: 'Accepted',
        reservationId: 12345,
      });
    });

    it('should create ReservationOutput without reservationId', () => {
      output.status = 'Rejected';

      expect(output.status).toBe('Rejected');
      expect(output.reservationId).toBeUndefined();
    });
  });
});
