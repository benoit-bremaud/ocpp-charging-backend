// Exporter tous les DTOs sauf HeartbeatInput (supprimé - Heartbeat n'a pas de paramètres)

// Inputs
export * from './input/AuthorizeInput';
export * from './input/CancelReservationInput';
export * from './input/ChangeAvailabilityInput';
export * from './input/ChangeConfigurationInput';
export * from './input/DiagnosticsStatusNotificationInput';
export * from './input/FirmwareStatusNotificationInput';
export * from './input/RemoteStartTransactionInput';
export * from './input/RemoteStopTransactionInput';
export * from './input/ReserveNowInput';
export * from './input/ResetInput';
export * from './input/SetChargingProfileInput';
export * from './input/StatusNotificationInput';
export * from './input/TriggerMessageInput';
export * from './input/UnlockConnectorInput';

// Outputs
export * from './output/AuthorizeOutput';
export * from './output/BootNotificationOutput';
export * from './output/CancelReservationOutput';
export * from './output/ChangeAvailabilityOutput';
export * from './output/ChangeConfigurationOutput';
export * from './output/ChargePointOutput';
export * from './output/DiagnosticsStatusNotificationOutput';
export * from './output/FirmwareStatusNotificationOutput';
export * from './output/RemoteStartTransactionOutput';
export * from './output/RemoteStopTransactionOutput';
export * from './output/ReservationOutput';
export * from './output/ResetOutput';
export * from './output/SetChargingProfileOutput';
export * from './output/TriggerMessageOutput';
export * from './output/UnlockConnectorOutput';

// Core DTOs
export * from './CreateChargePointInput';
export * from './UpdateChargePointInput';
export * from './OcppMessageInput';
export * from './OcppProtocol';
export * from './OcppResponseBuilders';
