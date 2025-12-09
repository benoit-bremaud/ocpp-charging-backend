/**
 * CertificateType Value Object
 * 
 * Represents types of X.509 certificates used in OCPP.
 * Immutable, self-validating.
 */

export enum CertificateTypeEnum {
  ROOT_CERTIFICATE = 'ROOT_CERTIFICATE',
  INTERMEDIATE_CERTIFICATE = 'INTERMEDIATE_CERTIFICATE',
  LEAF_CERTIFICATE = 'LEAF_CERTIFICATE',
  CRL = 'CRL',  // Certificate Revocation List
}

export enum CertificatePurposeEnum {
  CHARGING_STATION_CERTIFICATE = 'ChargingStationCertificate',
  CHARGING_STATION_OEM_CERTIFICATE = 'ChargingStationOemCertificate',
  MANUFACTURER_CERTIFICATE = 'ManufacturerCertificate',
  UTILITY_CERTIFICATE = 'UtilityCertificate',
}

export class CertificateType {
  private readonly type: CertificateTypeEnum;
  private readonly purpose?: CertificatePurposeEnum;

  // Factory method
  static create(
    type: string,
    purpose?: string
  ): CertificateType {
    CertificateType.validate(type, purpose);
    return new CertificateType(
      type as CertificateTypeEnum,
      purpose as CertificatePurposeEnum | undefined
    );
  }

  // Private constructor
  private constructor(
    type: CertificateTypeEnum,
    purpose?: CertificatePurposeEnum
  ) {
    this.type = type;
    this.purpose = purpose;
  }

  // Validation
  private static validate(type: string, purpose?: string): void {
    const validTypes = Object.values(CertificateTypeEnum);
    if (!validTypes.includes(type as CertificateTypeEnum)) {
      throw new Error(
        `Invalid certificate type: ${type}. Must be one of: ${validTypes.join(', ')}`
      );
    }

    if (purpose) {
      const validPurposes = Object.values(CertificatePurposeEnum);
      if (!validPurposes.includes(purpose as CertificatePurposeEnum)) {
        throw new Error(
          `Invalid certificate purpose: ${purpose}`
        );
      }
    }
  }

  // Getters
  getType(): CertificateTypeEnum {
    return this.type;
  }

  getPurpose(): CertificatePurposeEnum | undefined {
    return this.purpose;
  }

  isLeafCertificate(): boolean {
    return this.type === CertificateTypeEnum.LEAF_CERTIFICATE;
  }

  isIntermediateCertificate(): boolean {
    return this.type === CertificateTypeEnum.INTERMEDIATE_CERTIFICATE;
  }

  // Equality
  equals(other: CertificateType): boolean {
    return this.type === other.type && this.purpose === other.purpose;
  }

  // String representation
  toString(): string {
    return this.purpose ? `${this.type}(${this.purpose})` : this.type;
  }

  // JSON serialization
  toJSON(): object {
    return {
      type: this.type,
      ...(this.purpose && { purpose: this.purpose }),
    };
  }
}
