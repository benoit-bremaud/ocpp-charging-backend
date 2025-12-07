/**
 * OCPP 1.6 Edition 2 § 7.15 - CiString255Type
 * Case-insensitive string with maximum length of 255 characters
 *
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export type CiString255Type = string & { readonly __brand: 'CiString255Type' };

export function createCiString255Type(value: string): CiString255Type {
  if (!value || typeof value !== 'string') {
    throw new Error('CiString255Type must be a non-empty string');
  }
  if (value.length > 255) {
    throw new Error(`CiString255Type maximum length is 255. Got ${value.length}`);
  }
  return value as CiString255Type;
}

export function isCiString255Type(value: unknown): value is CiString255Type {
  return typeof value === 'string' && value.length > 0 && value.length <= 255;
}
