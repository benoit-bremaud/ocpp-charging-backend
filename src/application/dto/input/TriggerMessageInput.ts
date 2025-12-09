/**
 * TriggerMessage Request DTO
 * OCPP § 3.19 - Trigger charge point message
 */
export class TriggerMessageInput {
  /**
   * Unique identifier for this request
   */
  readonly chargePointId: string;

  /**
   * Message type to trigger
   */
  readonly requestedMessage: string;

  /**
   * Optional: Connector ID for status notification
   */
  readonly connectorId?: number;

  constructor(chargePointId: string, requestedMessage: string, connectorId?: number) {
    this.chargePointId = chargePointId;
    this.requestedMessage = requestedMessage;
    this.connectorId = connectorId;
  }
}
