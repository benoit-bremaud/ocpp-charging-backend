/**
 * OCPP 1.6 Edition 2 § 7.15 - CiString25Type
 * Case-insensitive string with maximum length of 25 characters
 *
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export type CiString25Type = string & { readonly __brand: 'CiString25Type' };

export function createCiString25Type(value: string): CiString25Type {
  if (!value || typeof value !== 'string') {
    throw new Error('CiString25Type must be a non-empty string');
  }
  if (value.length > 25) {
    throw new Error(`CiString25Type maximum length is 25. Got ${value.length}`);
  }
  return value as CiString25Type;
}

export function isCiString25Type(value: unknown): value is CiString25Type {
  return typeof value === 'string' && value.length > 0 && value.length <= 25;
}
