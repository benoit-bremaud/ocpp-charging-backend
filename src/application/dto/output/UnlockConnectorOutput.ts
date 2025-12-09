/**
 * UnlockConnector Response DTO
 * OCPP § 3.18 - Response to unlock connector request
 */
export class UnlockConnectorOutput {
  /**
   * Whether connector unlock was accepted or rejected
   * Accepted = connector will be unlocked
   * Rejected = connector cannot be unlocked
   */
  readonly status: 'Accepted' | 'Rejected';

  constructor(status: 'Accepted' | 'Rejected') {
    this.status = status;
  }

  static accepted(): UnlockConnectorOutput {
    return new UnlockConnectorOutput('Accepted');
  }

  static rejected(): UnlockConnectorOutput {
    return new UnlockConnectorOutput('Rejected');
  }
}
