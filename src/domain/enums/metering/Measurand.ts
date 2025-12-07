/**
 * OCPP 1.6 Edition 2 - Measurand
 * Measurand type
 *
 * @enum {string}
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export enum Measurand {
  EnergyActiveImportRegister = 'EnergyActiveImportRegister',
  EnergyActiveExportRegister = 'EnergyActiveExportRegister',
  EnergyReactiveImportRegister = 'EnergyReactiveImportRegister',
  EnergyReactiveExportRegister = 'EnergyReactiveExportRegister',
  EnergyActiveImportInterval = 'EnergyActiveImportInterval',
  EnergyActiveExportInterval = 'EnergyActiveExportInterval',
  EnergyReactiveImportInterval = 'EnergyReactiveImportInterval',
  EnergyReactiveExportInterval = 'EnergyReactiveExportInterval',
  PowerActiveImport = 'PowerActiveImport',
  PowerActiveExport = 'PowerActiveExport',
  PowerReactiveImport = 'PowerReactiveImport',
  PowerReactiveExport = 'PowerReactiveExport',
  PowerFactor = 'PowerFactor',
  CurrentImport = 'CurrentImport',
  CurrentExport = 'CurrentExport',
  CurrentOffered = 'CurrentOffered',
  Voltage = 'Voltage',
  Current = 'Ampere',
  Frequency = 'Frequency',
  Temperature = 'Temperature',
  SoC = 'SoC',
  RPM = 'RPM',
}
