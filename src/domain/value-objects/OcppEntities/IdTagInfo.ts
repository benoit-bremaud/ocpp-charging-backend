import { AuthorizationStatus } from '../../enums';

/**
 * OCPP 1.6 Edition 2 § 7.26 - IdTagInfo
 * Contains the result of an authorize request
 *
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export interface IdTagInfo {
  expiryDate?: string; // ISO 8601 datetime
  parentIdTag?: string;
  status: AuthorizationStatus;
}
