/**
 * OCPP 1.6 Edition 2 § 7.15 - CiString500Type
 * Case-insensitive string with maximum length of 500 characters
 *
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export type CiString500Type = string & { readonly __brand: 'CiString500Type' };

export function createCiString500Type(value: string): CiString500Type {
  if (!value || typeof value !== 'string') {
    throw new Error('CiString500Type must be a non-empty string');
  }
  if (value.length > 500) {
    throw new Error(`CiString500Type maximum length is 500. Got ${value.length}`);
  }
  return value as CiString500Type;
}

export function isCiString500Type(value: unknown): value is CiString500Type {
  return typeof value === 'string' && value.length > 0 && value.length <= 500;
}
