/**
 * Barrel Export pour tous les DTOs Input/Output
 *
 * Cette couche APPLICATION contient les Data Transfer Objects
 * pour les échanges entre couche PRESENTATION et APPLICATION
 */

// INPUT DTOs (depuis les messages OCPP)
export * from './input/AuthorizeInput';
export * from './input/BootNotificationInput';
export * from './input/HeartbeatInput';
export * from './input/StatusNotificationInput';
export * from './input/FirmwareStatusNotificationInput';
export * from './input/DiagnosticsStatusNotificationInput';
export * from './input/ReserveNowInput';
export * from './input/CancelReservationInput';

// OUTPUT DTOs (réponses OCPP)
export * from './output/ChargePointOutput';
export * from './output/AuthorizeOutput';
export * from './output/BootNotificationOutput';
export * from './output/FirmwareStatusNotificationOutput';
export * from './output/DiagnosticsStatusNotificationOutput';
export * from './output/ReservationOutput';
export * from './output/CancelReservationOutput';
