/**
 * OCPP 1.6 Edition 2 - UpdateStatus
 * Update status
 *
 * @enum {string}
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export enum UpdateStatus {
  Accepted = 'Accepted',
  AlreadyProcessing = 'AlreadyProcessing',
  InvalidCertificate = 'InvalidCertificate',
  RevokedCertificate = 'RevokedCertificate',
}
