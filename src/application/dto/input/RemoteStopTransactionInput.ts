/**
 * RemoteStopTransaction Request DTO
 * OCPP § 3.16 - Stop charging session remotely
 */
export class RemoteStopTransactionInput {
  /**
   * Unique identifier for this request
   */
  readonly chargePointId: string;

  /**
   * The transaction ID to stop
   */
  readonly transactionId: number;

  constructor(chargePointId: string, transactionId: number) {
    this.chargePointId = chargePointId;
    this.transactionId = transactionId;
  }
}
