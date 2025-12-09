/**
 * Reset Request DTO
 * OCPP § 3.17 - Reset charge point
 */
export class ResetInput {
  /**
   * Unique identifier for this request
   */
  readonly chargePointId: string;

  /**
   * Type of reset: Hard or Soft
   */
  readonly type: 'Hard' | 'Soft';

  constructor(chargePointId: string, type: 'Hard' | 'Soft') {
    this.chargePointId = chargePointId;
    this.type = type;
  }
}
