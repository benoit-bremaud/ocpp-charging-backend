/**
 * Domain Layer: Value Object representing OCPP message structure.
 *
 * CLEAN: Pure domain logic, no framework dependencies.
 * SOLID: Immutable, self-validating value object.
 */
export class OcppMessage {
  readonly messageTypeId: number; // [2] = CALL, [3] = CALLRESULT, [4] = CALLERROR
  readonly messageId: string;
  readonly action: string; // e.g., "BootNotification", "Heartbeat"
  readonly payload: Record<string, any>;
  readonly timestamp: Date;

  constructor(
    messageTypeId: number,
    messageId: string,
    action: string,
    payload: Record<string, any>,
  ) {
    this.validate(messageTypeId, messageId, action);

    this.messageTypeId = messageTypeId;
    this.messageId = messageId;
    this.action = action;
    this.payload = payload;
    this.timestamp = new Date();
  }

  private validate(messageTypeId: number, messageId: string, action: string): void {
    if (![2, 3, 4].includes(messageTypeId)) {
      throw new Error(
        `Invalid OCPP messageTypeId: ${messageTypeId}. Must be 2 (CALL), 3 (CALLRESULT), or 4 (CALLERROR)`,
      );
    }

    if (!messageId || messageId.trim().length === 0) {
      throw new Error('OCPP messageId must not be empty');
    }

    if (!action || action.trim().length === 0) {
      throw new Error('OCPP action must not be empty');
    }
  }

  /**
   * Check if this is a CALL message (request from ChargePoint).
   */
  isCall(): boolean {
    return this.messageTypeId === 2;
  }

  /**
   * Check if this is a CALLRESULT message (response).
   */
  isCallResult(): boolean {
    return this.messageTypeId === 3;
  }

  /**
   * Check if this is a CALLERROR message (error).
   */
  isCallError(): boolean {
    return this.messageTypeId === 4;
  }
}
