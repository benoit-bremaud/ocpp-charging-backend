/**
 * TriggerMessage Response DTO
 * OCPP § 3.19 - Response to trigger message request
 */
export class TriggerMessageOutput {
  /**
   * Whether message trigger was accepted or rejected
   * Accepted = message will be triggered
   * Rejected = message cannot be triggered
   */
  readonly status: 'Accepted' | 'Rejected';

  constructor(status: 'Accepted' | 'Rejected') {
    this.status = status;
  }

  static accepted(): TriggerMessageOutput {
    return new TriggerMessageOutput('Accepted');
  }

  static rejected(): TriggerMessageOutput {
    return new TriggerMessageOutput('Rejected');
  }
}
