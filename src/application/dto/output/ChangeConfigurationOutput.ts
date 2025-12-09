/**
 * ChangeConfiguration Response DTO
 * OCPP § 3.20 - Response to configuration change request
 */
export class ChangeConfigurationOutput {
  /**
   * Result of configuration change attempt
   * Accepted = configuration will be changed
   * Rejected = configuration change rejected
   * RebootRequired = change requires reboot
   * NotSupported = configuration key not supported
   */
  readonly status: 'Accepted' | 'Rejected' | 'RebootRequired' | 'NotSupported';

  constructor(status: 'Accepted' | 'Rejected' | 'RebootRequired' | 'NotSupported') {
    this.status = status;
  }

  static accepted(): ChangeConfigurationOutput {
    return new ChangeConfigurationOutput('Accepted');
  }

  static rejected(): ChangeConfigurationOutput {
    return new ChangeConfigurationOutput('Rejected');
  }

  static rebootRequired(): ChangeConfigurationOutput {
    return new ChangeConfigurationOutput('RebootRequired');
  }

  static notSupported(): ChangeConfigurationOutput {
    return new ChangeConfigurationOutput('NotSupported');
  }
}
