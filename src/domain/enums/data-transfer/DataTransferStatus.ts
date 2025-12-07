/**
 * OCPP 1.6 Edition 2 - DataTransferStatus
 * Data transfer status
 *
 * @enum {string}
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export enum DataTransferStatus {
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  UnknownMessageId = 'UnknownMessageId',
  UnknownVendorId = 'UnknownVendorId',
}
