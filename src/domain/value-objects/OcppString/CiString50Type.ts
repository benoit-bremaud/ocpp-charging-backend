/**
 * OCPP 1.6 Edition 2 § 7.15 - CiString50Type
 * Case-insensitive string with maximum length of 50 characters
 *
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export type CiString50Type = string & { readonly __brand: 'CiString50Type' };

export function createCiString50Type(value: string): CiString50Type {
  if (!value || typeof value !== 'string') {
    throw new Error('CiString50Type must be a non-empty string');
  }
  if (value.length > 50) {
    throw new Error(`CiString50Type maximum length is 50. Got ${value.length}`);
  }
  return value as CiString50Type;
}

export function isCiString50Type(value: unknown): value is CiString50Type {
  return typeof value === 'string' && value.length > 0 && value.length <= 50;
}
