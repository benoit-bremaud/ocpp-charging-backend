/**
 * RemoteStartTransaction Request DTO
 * OCPP § 3.15 - Initiate charging session remotely
 */
export class RemoteStartTransactionInput {
  /**
   * Unique identifier for this request
   */
  readonly chargePointId: string;

  /**
   * The ID token of the vehicle to start charging
   */
  readonly idTag: string;

  /**
   * Optional: Connector to use. If omitted, any free connector
   */
  readonly connectorId?: number;

  /**
   * Optional: Charging profile to apply
   */
  readonly chargingProfile?: {
    chargingProfileId: number;
    transactionId?: number;
    stackLevel: number;
    chargingProfilePurpose: string;
    chargingProfileKind: string;
    recurrencyKind?: string;
    validFrom?: string;
    validTo?: string;
  };

  constructor(
    chargePointId: string,
    idTag: string,
    connectorId?: number,
    chargingProfile?: any,
  ) {
    this.chargePointId = chargePointId;
    this.idTag = idTag;
    this.connectorId = connectorId;
    this.chargingProfile = chargingProfile;
  }
}
