/**
 * OCPP 1.6 Edition 2 - DiagnosticsStatus
 * Diagnostics status
 *
 * @enum {string}
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export enum DiagnosticsStatus {
  Idle = 'Idle',
  Uploading = 'Uploading',
  Uploaded = 'Uploaded',
  UploadFailed = 'UploadFailed',
}
