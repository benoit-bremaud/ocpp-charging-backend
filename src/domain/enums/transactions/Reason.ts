/**
 * OCPP 1.6 Edition 2 - Reason
 * Stop reason
 *
 * @enum {string}
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export enum Reason {
  DeAuthorized = 'DeAuthorized',
  EmergencyStop = 'EmergencyStop',
  EnergyLimitReached = 'EnergyLimitReached',
  EVDisconnected = 'EVDisconnected',
  MasterPass = 'MasterPass',
  Other = 'Other',
  PowerLoss = 'PowerLoss',
  Reboot = 'Reboot',
  Remote = 'Remote',
  SOCLimitReached = 'SOCLimitReached',
  StoppingEVSE = 'StoppingEVSE',
  Timeout = 'Timeout',
  UnlockCommand = 'UnlockCommand',
}
