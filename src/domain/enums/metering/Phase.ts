/**
 * OCPP 1.6 Edition 2 - Phase
 * Phase identification
 *
 * @enum {string}
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export enum Phase {
  L1 = 'L1',
  L2 = 'L2',
  L3 = 'L3',
  N = 'N',
  L1L2 = 'L1-L2',
  L2L3 = 'L2-L3',
  L1L3 = 'L1-L3',
}
