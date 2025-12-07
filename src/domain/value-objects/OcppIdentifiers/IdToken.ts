/**
 * OCPP 1.6 Edition 2 - IdToken
 * Unique identifier for authentication
 * Format: CiString20Type
 *
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export type IdToken = string & { readonly __brand: 'IdToken' };

export function createIdToken(value: string): IdToken {
  if (!value || typeof value !== 'string') {
    throw new Error('IdToken must be a non-empty string');
  }
  if (value.length > 20) {
    throw new Error(`IdToken maximum length is 20. Got ${value.length}`);
  }
  return value as IdToken;
}

export function isIdToken(value: unknown): value is IdToken {
  return typeof value === 'string' && value.length > 0 && value.length <= 20;
}
