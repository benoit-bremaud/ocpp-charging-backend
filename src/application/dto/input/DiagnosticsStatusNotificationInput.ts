/**
 * OCPP 1.6 § 4.11 - DiagnosticsStatusNotification Request
 */
export class DiagnosticsStatusNotificationInput {
  status: 'Idle' | 'Uploading' | 'UploadFailed' = 'Idle';
}
