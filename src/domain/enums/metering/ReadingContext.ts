/**
 * OCPP 1.6 Edition 2 - ReadingContext
 * Reading context
 *
 * @enum {string}
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export enum ReadingContext {
  Interruption = 'Interruption',
  SampleClock = 'SampleClock',
  SamplePeriodic = 'SamplePeriodic',
  TransactionBegin = 'TransactionBegin',
  TransactionEnd = 'TransactionEnd',
  Trigger = 'Trigger',
}
