/**
 * OCPP 1.6 Edition 2 - ConfigurationStatus
 * Configuration change status
 *
 * @enum {string}
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export enum ConfigurationStatus {
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  RebootRequired = 'RebootRequired',
  NotSupported = 'NotSupported',
}
