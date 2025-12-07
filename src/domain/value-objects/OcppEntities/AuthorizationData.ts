import { IdTagInfo } from './IdTagInfo';

/**
 * OCPP 1.6 Edition 2 § 7.22 - AuthorizationData
 * Authorization data including id tag and info
 *
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export interface AuthorizationData {
  idTag: string;
  idTagInfo: IdTagInfo;
}
