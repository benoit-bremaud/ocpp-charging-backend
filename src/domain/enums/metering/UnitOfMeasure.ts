/**
 * OCPP 1.6 Edition 2 - UnitOfMeasure
 * Unit of measurement
 *
 * @enum {string}
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export enum UnitOfMeasure {
  Celsius = 'Celsius',
  Fahrenheit = 'Fahrenheit',
  K = 'K',
  Percent = 'Percent',
  Meter = 'Meter',
  Kilometer = 'Kilometer',
  WattHour = 'Wh',
  KilowattHour = 'kWh',
  VarHour = 'varh',
  KiloVarHour = 'kvarh',
  Joule = 'J',
  Megajoule = 'MJ',
  WattMeter = 'Wm',
  VoltAmpere = 'VA',
  KiloVoltAmpere = 'kVA',
  Var = 'var',
  KiloVar = 'kvar',
  Ampere = 'A',
  Coulomb = 'C',
  Volt = 'V',
  Hertz = 'Hz',
  PercentPerSecond = '%/s',
  Watt = 'W',
  Milliwatt = 'mW',
  VoltAmpereReactive = 'VAr',
  Radian = 'rad',
}
