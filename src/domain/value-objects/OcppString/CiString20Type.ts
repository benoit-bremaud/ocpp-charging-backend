/**
 * OCPP 1.6 Edition 2 § 7.15 - CiString20Type
 * Case-insensitive string with maximum length of 20 characters
 *
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export type CiString20Type = string & { readonly __brand: 'CiString20Type' };

/**
 * Create a CiString20Type with validation
 * @throws {Error} if value is empty or exceeds 20 characters
 */
export function createCiString20Type(value: string): CiString20Type {
  if (!value || typeof value !== 'string') {
    throw new Error('CiString20Type must be a non-empty string');
  }
  if (value.length > 20) {
    throw new Error(`CiString20Type maximum length is 20. Got ${value.length}`);
  }
  return value as CiString20Type;
}

/**
 * Type guard for CiString20Type
 */
export function isCiString20Type(value: unknown): value is CiString20Type {
  return typeof value === 'string' && value.length > 0 && value.length <= 20;
}
