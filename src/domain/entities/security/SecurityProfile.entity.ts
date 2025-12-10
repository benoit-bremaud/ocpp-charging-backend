import { CipherSuite } from '../../value-objects/CipherSuite';
import { TLSVersion } from '../../value-objects/TLSVersion';

/**
 * SecurityProfile Entity
 *
 * Represents an OCPP 1.6J security profile.
 * - Profile 0: Unsecured (no TLS)
 * - Profile 1: TLS with password authentication
 * - Profile 2: TLS with certificate authentication
 * - Profile 3: TLS with mutual certificate authentication
 */

export enum SecurityProfileLevel {
  PROFILE_0 = 0, // Unsecured (deprecated)
  PROFILE_1 = 1, // TLS + Basic Auth
  PROFILE_2 = 2, // TLS + Client Certificate
  PROFILE_3 = 3, // TLS + Mutual Certificates
}

export class SecurityProfile {
  // Unique identifier
  private readonly id: string;

  // Core properties
  private readonly level: SecurityProfileLevel;
  private readonly tlsVersion: TLSVersion;
  private readonly cipherSuites: CipherSuite[];

  // Configuration
  private requireClientCertificate: boolean;
  private requireServerCertificate: boolean;
  private certificatePinning: boolean;

  // Audit properties
  private readonly createdAt: Date;
  private updatedAt: Date;

  /**
   * Factory method to create new security profile
   */
  static create(
    id: string,
    level: SecurityProfileLevel,
    tlsVersion: TLSVersion,
    cipherSuites: CipherSuite[],
  ): SecurityProfile {
    SecurityProfile.validate(level, tlsVersion, cipherSuites);
    return new SecurityProfile(
      id,
      level,
      tlsVersion,
      cipherSuites,
      false,
      false,
      false,
      new Date(),
    );
  }

  /**
   * Private constructor
   */
  private constructor(
    id: string,
    level: SecurityProfileLevel,
    tlsVersion: TLSVersion,
    cipherSuites: CipherSuite[],
    requireClientCertificate: boolean,
    requireServerCertificate: boolean,
    certificatePinning: boolean,
    createdAt: Date,
  ) {
    this.id = id;
    this.level = level;
    this.tlsVersion = tlsVersion;
    this.cipherSuites = cipherSuites;
    this.requireClientCertificate = requireClientCertificate;
    this.requireServerCertificate = requireServerCertificate;
    this.certificatePinning = certificatePinning;
    this.createdAt = createdAt;
    this.updatedAt = createdAt;
  }

  /**
   * Business logic validation
   */
  private static validate(
    level: SecurityProfileLevel,
    tlsVersion: TLSVersion,
    cipherSuites: CipherSuite[],
  ): void {
    // Validate profile level
    if (level < SecurityProfileLevel.PROFILE_0 || level > SecurityProfileLevel.PROFILE_3) {
      throw new Error(`Invalid security profile level: ${level}`);
    }

    // Profile 0 doesn't use TLS
    if (level === SecurityProfileLevel.PROFILE_0) {
      throw new Error('Profile 0 (Unsecured) is deprecated and not supported');
    }

    // Must have at least one cipher suite
    if (!cipherSuites || cipherSuites.length === 0) {
      throw new Error('At least one cipher suite must be specified');
    }

    // TLS 1.2 minimum for all profiles
    if (tlsVersion.getValue() !== 'TLS_1_2' && tlsVersion.getValue() !== 'TLS_1_3') {
      throw new Error(`All profiles require TLS 1.2 or higher`);
    }
  }

  /**
   * Getters (read-only access to properties)
   */
  getId(): string {
    return this.id;
  }

  getLevel(): SecurityProfileLevel {
    return this.level;
  }

  getTlsVersion(): TLSVersion {
    return this.tlsVersion;
  }

  getCipherSuites(): CipherSuite[] {
    return [...this.cipherSuites]; // Return copy to prevent mutation
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt); // Return copy
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt); // Return copy
  }

  /**
   * Business logic methods
   */
  requiresClientCertificate(): boolean {
    return this.level >= SecurityProfileLevel.PROFILE_2;
  }

  requiresServerCertificate(): boolean {
    return this.level >= SecurityProfileLevel.PROFILE_1;
  }

  isMutualTLS(): boolean {
    return this.level === SecurityProfileLevel.PROFILE_3;
  }

  supportsBasicAuth(): boolean {
    return this.level === SecurityProfileLevel.PROFILE_1;
  }

  /**
   * Configuration methods
   */
  enableCertificatePinning(): void {
    this.certificatePinning = true;
    this.updatedAt = new Date();
  }

  disableCertificatePinning(): void {
    this.certificatePinning = false;
    this.updatedAt = new Date();
  }

  isCertificatePinningEnabled(): boolean {
    return this.certificatePinning;
  }

  /**
   * Upgrade profile to higher security level
   */
  upgradeToProfile(newLevel: SecurityProfileLevel): SecurityProfile {
    if (newLevel <= this.level) {
      throw new Error(`Cannot downgrade from Profile ${this.level} to Profile ${newLevel}`);
    }
    if (newLevel > SecurityProfileLevel.PROFILE_3) {
      throw new Error(`Invalid profile level: ${newLevel}`);
    }

    // Create new instance with updated level, keep other properties
    return SecurityProfile.create(
      this.id, // ← pas chargingStationId
      newLevel,
      this.tlsVersion,
      this.cipherSuites, // ← c'est un array
    );
  }

  /**
   * Serialization
   */
  toJSON(): object {
    return {
      id: this.id,
      level: this.level,
      tlsVersion: this.tlsVersion.toString(),
      cipherSuites: this.cipherSuites.map((cs) => cs.toString()),
      requiresClientCertificate: this.requiresClientCertificate(),
      requiresServerCertificate: this.requiresServerCertificate(),
      isMutualTLS: this.isMutualTLS(),
      certificatePinning: this.certificatePinning,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  toString(): string {
    return `SecurityProfile(id=${this.id}, level=${this.level}, tls=${this.tlsVersion})`;
  }
}
