/**
 * ReservationOutput DTO
 * 
 * Data Transfer Object pour la réponse de réservation
 * 
 * OCPP 1.6 § 3.3 - Reserve Now
 */
export class ReservationOutput {
  status: 'Accepted' | 'Faulted' | 'Occupied' | 'Rejected' | 'Unavailable' = 'Accepted';
  reservationId?: number;
}
