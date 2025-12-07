import { ChargingRateUnitType } from '../../enums';

/**
 * OCPP 1.6 Edition 2 § 7.24 - ChargingSchedulePeriod
 */
export interface ChargingSchedulePeriod {
  startPeriod: number;
  limit: number;
  numberPhases?: number;
}

/**
 * OCPP 1.6 Edition 2 § 7.23 - ChargingSchedule
 * Defines charging power/current limits over time
 *
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export interface ChargingSchedule {
  duration?: number;
  startSchedule?: string; // ISO 8601 datetime
  chargingRateUnit: ChargingRateUnitType;
  chargingSchedulePeriod: ChargingSchedulePeriod[];
  minChargingRate?: number;
}
