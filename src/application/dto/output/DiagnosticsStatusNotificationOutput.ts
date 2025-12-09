/**
 * DiagnosticsStatusNotificationOutput DTO
 *
 * Data Transfer Object pour la réponse de statut de diagnostic
 *
 * OCPP 1.6 § 4.11 - Diagnostics Status Notification
 */
export class DiagnosticsStatusNotificationOutput {
  status: 'Idle' | 'Uploading' | 'UploadFailed' = 'Idle';
}
