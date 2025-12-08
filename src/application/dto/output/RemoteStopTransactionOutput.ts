/**
 * RemoteStopTransaction Response DTO
 * OCPP § 3.16 - Response to remote stop request
 */
export class RemoteStopTransactionOutput {
  /**
   * Whether remote stop was accepted or rejected
   * Accepted = transaction will be stopped
   * Rejected = transaction cannot be stopped
   */
  readonly status: 'Accepted' | 'Rejected';

  constructor(status: 'Accepted' | 'Rejected') {
    this.status = status;
  }

  static accepted(): RemoteStopTransactionOutput {
    return new RemoteStopTransactionOutput('Accepted');
  }

  static rejected(): RemoteStopTransactionOutput {
    return new RemoteStopTransactionOutput('Rejected');
  }
}
