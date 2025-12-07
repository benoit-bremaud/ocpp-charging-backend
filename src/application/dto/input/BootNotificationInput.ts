/**
 * OCPP 1.6 § 2.2 - BootNotification Request
 */
export class BootNotificationInput {
  chargePointVendor: string = '';
  chargePointModel: string = '';
  chargePointSerialNumber?: string;
  chargeBoxSerialNumber?: string;
  firmwareVersion?: string;
  iccid?: string;
  imsi?: string;
}
