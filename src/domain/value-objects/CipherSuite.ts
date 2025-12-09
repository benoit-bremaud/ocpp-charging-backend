/**
 * CipherSuite Value Object
 * 
 * Represents valid cipher suites for TLS connections.
 * Immutable, self-validating.
 */

export enum CipherSuiteEnum {
  // TLS 1.2 Cipher Suites
  TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 = 'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
  TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 = 'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
  TLS_RSA_WITH_AES_128_GCM_SHA256 = 'TLS_RSA_WITH_AES_128_GCM_SHA256',
  TLS_RSA_WITH_AES_256_GCM_SHA384 = 'TLS_RSA_WITH_AES_256_GCM_SHA384',

  // TLS 1.3 Cipher Suites
  TLS_AES_128_GCM_SHA256 = 'TLS_AES_128_GCM_SHA256',
  TLS_AES_256_GCM_SHA384 = 'TLS_AES_256_GCM_SHA384',
  TLS_CHACHA20_POLY1305_SHA256 = 'TLS_CHACHA20_POLY1305_SHA256',
}

export class CipherSuite {
  private readonly value: CipherSuiteEnum;

  // Factory method
  static create(value: string): CipherSuite {
    CipherSuite.validate(value);
    return new CipherSuite(value as CipherSuiteEnum);
  }

  // Private constructor
  private constructor(value: CipherSuiteEnum) {
    this.value = value;
  }

  // Validation logic
  private static validate(value: string): void {
    const validSuites = Object.values(CipherSuiteEnum);
    if (!validSuites.includes(value as CipherSuiteEnum)) {
      throw new Error(
        `Invalid cipher suite: ${value}. Must be one of the supported suites.`
      );
    }

    // Business rule: Weak cipher suites not allowed
    const weakPatterns = ['DES', 'RC4', 'MD5', 'NULL'];
    if (weakPatterns.some(pattern => value.includes(pattern))) {
      throw new Error(`Weak cipher suite not allowed: ${value}`);
    }
  }

  // Getters
  getValue(): CipherSuiteEnum {
    return this.value;
  }

  isModern(): boolean {
    return this.value.startsWith('TLS_AES_') || 
           this.value.startsWith('TLS_CHACHA20_');
  }

  // Equality
  equals(other: CipherSuite): boolean {
    return this.value === other.value;
  }

  // String representation
  toString(): string {
    return this.value;
  }

  // JSON serialization
  toJSON(): string {
    return this.value;
  }
}
