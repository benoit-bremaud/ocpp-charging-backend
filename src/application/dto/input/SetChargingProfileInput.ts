/**
 * SetChargingProfile Request DTO
 * OCPP § 3.22 - Set charging profile
 */
export class SetChargingProfileInput {
  /**
   * Unique identifier for this request
   */
  readonly chargePointId: string;

  /**
   * Connector ID to set profile for
   */
  readonly connectorId: number;

  /**
   * Charging profile details
   */
  readonly chargingProfile: {
    chargingProfileId: number;
    transactionId?: number;
    stackLevel: number;
    chargingProfilePurpose: string;
    chargingProfileKind: string;
    recurrencyKind?: string;
    validFrom?: string;
    validTo?: string;
    chargingSchedule: {
      duration?: number;
      startSchedule?: string;
      chargingRateUnit: string;
      chargingSchedulePeriod: Array<{
        startPeriod: number;
        limit: number;
        numberPhases?: number;
      }>;
      minChargingRate?: number;
    };
  };

  constructor(chargePointId: string, connectorId: number, chargingProfile: unknown) {
    this.chargePointId = chargePointId;
    this.connectorId = connectorId;
    this.chargingProfile = chargingProfile;
  }
}
