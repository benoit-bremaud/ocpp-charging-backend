/**
 * TLSVersion Value Object
 *
 * Represents valid TLS versions for security profiles.
 * Immutable, self-validating.
 */

export enum TLSVersionEnum {
  TLS_1_0 = 'TLS_1_0',
  TLS_1_1 = 'TLS_1_1',
  TLS_1_2 = 'TLS_1_2',
  TLS_1_3 = 'TLS_1_3',
}

export class TLSVersion {
  private readonly value: TLSVersionEnum;

  // Factory method (recommended way to create)
  static create(value: string): TLSVersion {
    TLSVersion.validate(value);
    return new TLSVersion(value as TLSVersionEnum);
  }

  // Private constructor (prevents invalid instances)
  private constructor(value: TLSVersionEnum) {
    this.value = value;
  }

  // Validation logic
  private static validate(value: string): void {
    const validVersions = Object.values(TLSVersionEnum);
    if (!validVersions.includes(value as TLSVersionEnum)) {
      throw new Error(`Invalid TLS version: ${value}. Must be one of: ${validVersions.join(', ')}`);
    }

    // Business rule: TLS 1.0 and 1.1 are deprecated
    if (value === TLSVersionEnum.TLS_1_0 || value === TLSVersionEnum.TLS_1_1) {
      throw new Error(
        `TLS ${value.replace('TLS_', '').replace('_', '.')} is deprecated. Use TLS 1.2 or higher.`,
      );
    }
  }

  // Getters
  getValue(): TLSVersionEnum {
    return this.value;
  }

  getVersionString(): string {
    return this.value.replace('TLS_', '').replace(/_/g, '.');
  }

  // Equality comparison (Value Objects should have equals)
  equals(other: TLSVersion): boolean {
    return this.value === other.value;
  }

  // String representation
  toString(): string {
    return this.getVersionString();
  }

  // JSON serialization
  toJSON(): string {
    return this.value;
  }
}
