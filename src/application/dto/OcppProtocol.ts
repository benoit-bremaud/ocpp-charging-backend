/**
 * OCPP 1.6 Protocol Data Transfer Objects
 *
 * Per OCPP 1.6 Specification:
 * - CALL: [2, uniqueId, action, payload]
 * - CALLRESULT: [3, uniqueId, payload]
 * - CALLERROR: [4, uniqueId, errorCode, errorDescription]
 */

/**
 * CALL Request (from ChargePoint → Server)
 * Format: [2, messageId, action, payload]
 */
export interface OcppCallRequest {
  messageTypeId: 2;
  messageId: string;
  action: string;
  payload: Record<string, unknown>;
}

/**
 * CALLRESULT Response (from Server → ChargePoint)
 * Format: [3, messageId, payload]
 */
export interface OcppCallResult {
  messageTypeId: 3;
  messageId: string;
  payload: Record<string, unknown>;
}

/**
 * CALLERROR Response (from Server → ChargePoint)
 * Format: [4, messageId, errorCode, errorDescription]
 */
export interface OcppCallError {
  messageTypeId: 4;
  messageId: string;
  errorCode: string;
  errorDescription: string;
}

/**
 * Union type for any OCPP message
 */
export type OcppMessage = OcppCallRequest | OcppCallResult | OcppCallError;

/**
 * Serialize OCPP message to wire format (array)
 */
export function serializeOcppMessage(msg: OcppMessage): unknown[] {
  if (msg.messageTypeId === 2) {
    // CALL
    return [2, msg.messageId, (msg as OcppCallRequest).action, (msg as OcppCallRequest).payload];
  }
  if (msg.messageTypeId === 3) {
    // CALLRESULT
    return [3, msg.messageId, (msg as OcppCallResult).payload];
  }
  if (msg.messageTypeId === 4) {
    // CALLERROR
    return [
      4,
      msg.messageId,
      (msg as OcppCallError).errorCode,
      (msg as OcppCallError).errorDescription,
    ];
  }
  // Exhaustive check - this should never happen
  const exhaustiveCheck: never = msg;
  throw new Error(`Invalid message type: ${(exhaustiveCheck as unknown as Record<string, unknown>).messageTypeId}`);
}

/**
 * Deserialize wire format to OCPP message
 */
export function deserializeOcppMessage(data: unknown): OcppMessage {
  if (!Array.isArray(data)) {
    throw new Error('Invalid message format: expected array');
  }

  const [messageTypeId, messageId, ...rest] = data;

  if (messageTypeId === 2) {
    // CALL
    return {
      messageTypeId: 2,
      messageId: messageId as string,
      action: rest[0] as string,
      payload: (rest[1] as Record<string, unknown>) || {},
    };
  }

  if (messageTypeId === 3) {
    // CALLRESULT
    return {
      messageTypeId: 3,
      messageId: messageId as string,
      payload: (rest[0] as Record<string, unknown>) || {},
    };
  }

  if (messageTypeId === 4) {
    // CALLERROR
    return {
      messageTypeId: 4,
      messageId: messageId as string,
      errorCode: rest[0] as string,
      errorDescription: rest[1] as string,
    };
  }

  throw new Error(`Invalid message type: ${messageTypeId}`);
}

/**
 * Helper: Create CALLRESULT response
 */
export function createCallResult(messageId: string, payload: Record<string, unknown>): OcppCallResult {
  return {
    messageTypeId: 3,
    messageId,
    payload,
  };
}

/**
 * Helper: Create CALLERROR response
 */
export function createCallError(
  messageId: string,
  errorCode: string,
  errorDescription: string,
): OcppCallError {
  return {
    messageTypeId: 4,
    messageId,
    errorCode,
    errorDescription,
  };
}
