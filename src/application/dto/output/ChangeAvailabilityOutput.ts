/**
 * ChangeAvailability Response DTO
 * OCPP § 3.21 - Response to availability change request
 */
export class ChangeAvailabilityOutput {
  /**
   * Result of availability change attempt
   * Accepted = availability will be changed
   * Rejected = availability change rejected
   * Scheduled = change is scheduled
   */
  readonly status: 'Accepted' | 'Rejected' | 'Scheduled';

  constructor(status: 'Accepted' | 'Rejected' | 'Scheduled') {
    this.status = status;
  }

  static accepted(): ChangeAvailabilityOutput {
    return new ChangeAvailabilityOutput('Accepted');
  }

  static rejected(): ChangeAvailabilityOutput {
    return new ChangeAvailabilityOutput('Rejected');
  }

  static scheduled(): ChangeAvailabilityOutput {
    return new ChangeAvailabilityOutput('Scheduled');
  }
}
