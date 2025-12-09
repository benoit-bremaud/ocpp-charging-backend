/**
 * Domain Layer: Value Object for Heartbeat request validation.
 *
 * OCPP 1.6 Spec: Heartbeat has NO payload fields (always empty object {})
 * CLEAN: Immutable value object with self-validation.
 * SOLID: SRP - represents heartbeat status only.
 */
export class HeartbeatStatus {
  readonly isValid: boolean;
  readonly reason?: string;

  constructor(payload: Record<string, unknown>) {
    // Per OCPP 1.6: Heartbeat payload MUST be empty
    const isEmpty = Object.keys(payload).length === 0;

    if (!isEmpty) {
      this.isValid = false;
      this.reason = `Heartbeat payload must be empty, got: ${JSON.stringify(payload)}`;
    } else {
      this.isValid = true;
    }
  }
}
