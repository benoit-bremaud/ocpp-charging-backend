/**
 * OCPP 1.6J BootNotification Message Types
 * Source: Official OCPP 1.6J Specification
 *
 * This is the SINGLE SOURCE OF TRUTH for BootNotification structure.
 * NO DTO Input/Output duplication.
 */

// === REQUEST ===
export interface BootNotificationRequest {
  chargePointVendor: string; // REQUIRED - Max 20 chars
  chargePointModel: string; // REQUIRED - Max 20 chars
  chargeBoxSerialNumber?: string; // OPTIONAL - Max 25 chars
  chargePointSerialNumber?: string; // OPTIONAL - Max 25 chars
  firmwareVersion?: string; // OPTIONAL - Max 50 chars
  iccid?: string; // OPTIONAL - Max 20 chars
  imsi?: string; // OPTIONAL - Max 20 chars
  meterSerialNumber?: string; // OPTIONAL - Max 25 chars
  meterType?: string; // OPTIONAL - Max 25 chars
}

// === RESPONSE ===
export interface BootNotificationResponse {
  currentTime: string; // REQUIRED - ISO 8601 datetime
  interval: number; // REQUIRED - Seconds (0-3600)
  status: 'Accepted' | 'Pending' | 'Rejected'; // REQUIRED
}

// === DOMAIN VALIDATION CLASS ===
export class BootNotificationMessage {
  constructor(
    public request: BootNotificationRequest,
    public response?: BootNotificationResponse,
  ) {
    // Will be validated by OcppSchema at handler level
  }

  /**
   * Static factory - parses raw OCPP payload
   */
  static fromOcppPayload(payload: unknown): BootNotificationRequest {
    if (typeof payload !== 'object' || !payload) {
      throw new Error('BootNotification payload must be an object');
    }
    return payload as BootNotificationRequest;
  }
}
