/**
 * FirmwareStatusNotificationOutput DTO
 * 
 * Data Transfer Object pour la réponse de statut de firmware
 * 
 * OCPP 1.6 § 4.10 - Firmware Status Notification
 */
export class FirmwareStatusNotificationOutput {
  status: 'Downloaded' | 'Downloading' | 'Idle' | 'InstallationFailed' | 'Installing' | 'Installed' = 'Idle';
}
