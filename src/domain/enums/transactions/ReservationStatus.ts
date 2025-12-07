/**
 * OCPP 1.6 Edition 2 - ReservationStatus
 * Reservation status
 *
 * @enum {string}
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export enum ReservationStatus {
  Accepted = 'Accepted',
  Faulted = 'Faulted',
  Occupied = 'Occupied',
  Rejected = 'Rejected',
  Unavailable = 'Unavailable',
}
