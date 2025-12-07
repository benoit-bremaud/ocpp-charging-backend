export enum ChargePointStatus {
  AVAILABLE = 'Available',
  PREPARING = 'Preparing',
  CHARGING = 'Charging',
  SUSPENDED_EVSE = 'SuspendedEVSE',
  SUSPENDED_EV = 'SuspendedEV',
  FINISHING = 'Finishing',
  RESERVED = 'Reserved',
  UNAVAILABLE = 'Unavailable',
  FAULTED = 'Faulted',
}

export const isOperativeStatus = (status: ChargePointStatus): boolean => {
  return [
    ChargePointStatus.AVAILABLE,
    ChargePointStatus.PREPARING,
    ChargePointStatus.CHARGING,
    ChargePointStatus.SUSPENDED_EVSE,
    ChargePointStatus.SUSPENDED_EV,
    ChargePointStatus.FINISHING,
    ChargePointStatus.RESERVED,
  ].includes(status);
};
