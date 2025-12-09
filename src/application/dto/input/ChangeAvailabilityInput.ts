/**
 * ChangeAvailability Request DTO
 * OCPP § 3.21 - Change charge point/connector availability
 */
export class ChangeAvailabilityInput {
  /**
   * Unique identifier for this request
   */
  readonly chargePointId: string;

  /**
   * Connector ID (0 = whole charge point)
   */
  readonly connectorId: number;

  /**
   * Availability type: Operative or Inoperative
   */
  readonly type: 'Operative' | 'Inoperative';

  constructor(chargePointId: string, connectorId: number, type: 'Operative' | 'Inoperative') {
    this.chargePointId = chargePointId;
    this.connectorId = connectorId;
    this.type = type;
  }
}
