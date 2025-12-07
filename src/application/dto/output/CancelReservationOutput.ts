/**
 * CancelReservationOutput DTO
 * 
 * Data Transfer Object pour la réponse d'annulation de réservation
 * 
 * OCPP 1.6 § 3.4 - Cancel Reservation
 */
export class CancelReservationOutput {
  status: 'Accepted' | 'Rejected' = 'Accepted';
}
