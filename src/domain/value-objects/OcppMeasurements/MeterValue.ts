import { SampledValue } from './SampledValue';

/**
 * OCPP 1.6 Edition 2 § 7.33 - MeterValue
 * Collection of sampled values with timestamp
 *
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export interface MeterValue {
  timestamp: string; // ISO 8601 datetime
  sampledValue: SampledValue[];
}
