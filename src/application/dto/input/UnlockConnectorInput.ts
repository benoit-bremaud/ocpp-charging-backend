/**
 * UnlockConnector Request DTO
 * OCPP § 3.18 - Unlock specific connector
 */
export class UnlockConnectorInput {
  /**
   * Unique identifier for this request
   */
  readonly chargePointId: string;

  /**
   * The connector ID to unlock
   */
  readonly connectorId: number;

  constructor(chargePointId: string, connectorId: number) {
    this.chargePointId = chargePointId;
    this.connectorId = connectorId;
  }
}
