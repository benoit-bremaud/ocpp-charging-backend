/**
 * OCPP 1.6J Heartbeat Message Types
 */

export interface HeartbeatRequest {
  // EMPTY - No parameters allowed
}

export interface HeartbeatResponse {
  currentTime: string; // REQUIRED - ISO 8601
}

export class HeartbeatMessage {
  constructor(
    public request: HeartbeatRequest = {},
    public response?: HeartbeatResponse
  ) {}

  static fromOcppPayload(payload: unknown): HeartbeatRequest {
    if (typeof payload === 'object' && payload !== null) {
      // OCPP spec: Heartbeat.req MUST have empty payload
      const keys = Object.keys(payload);
      if (keys.length > 0) {
        throw new Error(`Heartbeat.req must be empty, got ${keys.join(',')}`);
      }
    }
    return {};
  }
}
