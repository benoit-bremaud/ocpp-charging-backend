/**
 * OCPP 1.6 § 4.10 - FirmwareStatusNotification Request
 */
export class FirmwareStatusNotificationInput {
  status: 'Downloaded' | 'Downloading' | 'Idle' | 'InstallationFailed' | 'Installing' | 'Installed' = 'Idle';
}
