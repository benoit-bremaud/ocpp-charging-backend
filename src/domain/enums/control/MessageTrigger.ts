/**
 * OCPP 1.6 Edition 2 - MessageTrigger
 * Message type to trigger
 *
 * @enum {string}
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export enum MessageTrigger {
  BootNotification = 'BootNotification',
  DiagnosticsStatusNotification = 'DiagnosticsStatusNotification',
  FirmwareStatusNotification = 'FirmwareStatusNotification',
  Heartbeat = 'Heartbeat',
  MeterValues = 'MeterValues',
  StatusNotification = 'StatusNotification',
}
