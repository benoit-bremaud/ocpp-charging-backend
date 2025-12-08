/**
 * SetChargingProfile Response DTO
 * OCPP § 3.22 - Response to set charging profile request
 */
export class SetChargingProfileOutput {
  /**
   * Result of charging profile set attempt
   * Accepted = profile will be set
   * Rejected = profile rejected
   * NotSupported = profile not supported
   */
  readonly status: 'Accepted' | 'Rejected' | 'NotSupported';

  constructor(status: 'Accepted' | 'Rejected' | 'NotSupported') {
    this.status = status;
  }

  static accepted(): SetChargingProfileOutput {
    return new SetChargingProfileOutput('Accepted');
  }

  static rejected(): SetChargingProfileOutput {
    return new SetChargingProfileOutput('Rejected');
  }

  static notSupported(): SetChargingProfileOutput {
    return new SetChargingProfileOutput('NotSupported');
  }
}
