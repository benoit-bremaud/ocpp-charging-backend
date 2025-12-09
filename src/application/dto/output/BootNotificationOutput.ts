/**
 * BootNotificationOutput DTO
 *
 * Data Transfer Object pour la réponse de notification de démarrage
 *
 * OCPP 1.6 § 3.2 - Boot Notification
 */
export class BootNotificationOutput {
  status: 'Accepted' | 'Pending' | 'Rejected' = 'Accepted';
  currentTime: string = new Date().toISOString();
  interval: number = 900;
}
