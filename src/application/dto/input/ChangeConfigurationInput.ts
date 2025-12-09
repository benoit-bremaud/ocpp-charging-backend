/**
 * ChangeConfiguration Request DTO
 * OCPP § 3.20 - Change configuration settings
 */
export class ChangeConfigurationInput {
  /**
   * Unique identifier for this request
   */
  readonly chargePointId: string;

  /**
   * Configuration key to change
   */
  readonly key: string;

  /**
   * New value for configuration key
   */
  readonly value: string;

  constructor(chargePointId: string, key: string, value: string) {
    this.chargePointId = chargePointId;
    this.key = key;
    this.value = value;
  }
}
