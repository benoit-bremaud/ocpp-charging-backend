/**
 * RemoteStartTransaction Response DTO
 * OCPP § 3.15 - Response to remote start request
 */
export class RemoteStartTransactionOutput {
  /**
   * Whether remote start was accepted or rejected
   * Accepted = charging can be started
   * Rejected = charging cannot be started
   */
  readonly status: 'Accepted' | 'Rejected';

  constructor(status: 'Accepted' | 'Rejected') {
    this.status = status;
  }

  static accepted(): RemoteStartTransactionOutput {
    return new RemoteStartTransactionOutput('Accepted');
  }

  static rejected(): RemoteStartTransactionOutput {
    return new RemoteStartTransactionOutput('Rejected');
  }
}
