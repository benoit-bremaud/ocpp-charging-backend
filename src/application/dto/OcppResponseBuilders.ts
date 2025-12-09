import { createCallResult, createCallError, serializeOcppMessage } from './OcppProtocol';

/**
 * Type-safe builders for OCPP responses
 * Ensures responses match OCPP 1.6 schema exactly
 * Returns wire format (unknown[]) ready for WebSocket transmission
 */

// ============ BootNotificationResponse ============
export interface BootNotificationResponsePayload {
  status: 'Accepted' | 'Pending' | 'Rejected';
  currentTime: string; // ISO 8601 datetime
  interval: number; // Seconds
}

export function buildBootNotificationResponse(
  messageId: string,
  status: 'Accepted' | 'Pending' | 'Rejected',
  interval: number = 900,
): unknown[] {
  const payload: BootNotificationResponsePayload = {
    status,
    currentTime: new Date().toISOString(),
    interval,
  };
  const response = createCallResult(messageId, payload as unknown as Record<string, unknown>);
  return serializeOcppMessage(response);
}

// ============ HeartbeatResponse ============
export interface HeartbeatResponsePayload {
  currentTime: string; // ISO 8601 datetime
}

export function buildHeartbeatResponse(messageId: string): unknown[] {
  const payload: HeartbeatResponsePayload = {
    currentTime: new Date().toISOString(),
  };
  const response = createCallResult(messageId, payload as unknown as Record<string, unknown>);
  return serializeOcppMessage(response);
}

// ============ StatusNotificationResponse ============
export interface StatusNotificationResponsePayload {
  // Empty per OCPP 1.6 spec
}

export function buildStatusNotificationResponse(messageId: string): unknown[] {
  const response = createCallResult(messageId, {});
  return serializeOcppMessage(response);
}

// ============ Error Responses ============
export function buildFormationViolation(messageId: string, description: string): unknown[] {
  const response = createCallError(messageId, 'FormationViolation', description);
  return serializeOcppMessage(response);
}

export function buildNotImplemented(messageId: string, action: string): unknown[] {
  const response = createCallError(
    messageId,
    'NotImplemented',
    `Handler not implemented for action: ${action}`,
  );
  return serializeOcppMessage(response);
}

export function buildGenericError(messageId: string, description: string): unknown[] {
  const response = createCallError(messageId, 'GenericError', description);
  return serializeOcppMessage(response);
}

export function buildInternalError(messageId: string, description: string): unknown[] {
  const response = createCallError(messageId, 'InternalError', description);
  return serializeOcppMessage(response);
}
