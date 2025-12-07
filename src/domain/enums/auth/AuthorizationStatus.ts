/**
 * OCPP 1.6 Edition 2 § 7.2 - AuthorizationStatus
 * Result of an Authorize.req or operation requiring authorization
 *
 * @enum {string}
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export enum AuthorizationStatus {
  /** Transaction accepted */
  Accepted = 'Accepted',

  /** Transaction blocked */
  Blocked = 'Blocked',

  /** Transaction expired */
  Expired = 'Expired',

  /** Invalid card/token */
  Invalid = 'Invalid',

  /** Another transaction concurrent with this card already exists */
  ConcurrentTx = 'ConcurrentTx',
}
