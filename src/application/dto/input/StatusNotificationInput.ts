/**
 * OCPP 1.6 § 2.4 - StatusNotification Request
 */
export class StatusNotificationInput {
  connectorId: number = 0;
  errorCode: string = '';
  status: string = '';
  timestamp?: string;
  vendorId?: string;
  vendorErrorCode?: string;
}
