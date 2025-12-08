/**
 * Reset Response DTO
 * OCPP § 3.17 - Response to reset request
 */
export class ResetOutput {
  /**
   * Whether reset was accepted or rejected
   * Accepted = charge point will be reset
   * Rejected = reset cannot be performed
   */
  readonly status: 'Accepted' | 'Rejected';

  constructor(status: 'Accepted' | 'Rejected') {
    this.status = status;
  }

  static accepted(): ResetOutput {
    return new ResetOutput('Accepted');
  }

  static rejected(): ResetOutput {
    return new ResetOutput('Rejected');
  }
}
