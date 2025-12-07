/**
 * OCPP 1.6 Edition 2 § 7.29 - KeyValue
 * Key-value pair for configuration
 *
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export interface KeyValue {
  key: string;
  readonly?: boolean;
  value: string;
}
