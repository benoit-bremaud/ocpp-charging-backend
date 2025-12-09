import { SecurityProfile, SecurityProfileLevel } from '../SecurityProfile.entity';
import { TLSVersion } from '../../../value-objects/TLSVersion';
import { CipherSuite } from '../../../value-objects/CipherSuite';

describe('SecurityProfile Entity', () => {
  let tlsVersion: TLSVersion;
  let cipherSuites: CipherSuite[];

  beforeEach(() => {
    tlsVersion = TLSVersion.create('TLS_1_2');
    cipherSuites = [CipherSuite.create('TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256')];
  });

  describe('Creation', () => {
    it('should create a valid security profile', () => {
      const profile = SecurityProfile.create(
        'profile-1',
        SecurityProfileLevel.PROFILE_1,
        tlsVersion,
        cipherSuites,
      );

      expect(profile).toBeDefined();
      expect(profile.getId()).toBe('profile-1');
      expect(profile.getLevel()).toBe(SecurityProfileLevel.PROFILE_1);
    });

    it('should reject Profile 0 (unsecured)', () => {
      expect(() => {
        SecurityProfile.create(
          'profile-0',
          SecurityProfileLevel.PROFILE_0,
          tlsVersion,
          cipherSuites,
        );
      }).toThrow('deprecated');
    });

    it('should reject empty cipher suites', () => {
      expect(() => {
        SecurityProfile.create('profile-1', SecurityProfileLevel.PROFILE_1, tlsVersion, []);
      }).toThrow('At least one cipher suite');
    });

    it('should require TLS 1.2 or higher for Profile 1', () => {
      expect(() => {
        SecurityProfile.create(
          'profile-1',
          SecurityProfileLevel.PROFILE_1,
          TLSVersion.create('TLS_1_2'),
          cipherSuites,
        );
      }).not.toThrow();
    });
  });

  describe('Profile Features', () => {
    it('should identify Profile 1 as basic auth capable', () => {
      const profile = SecurityProfile.create(
        'p1',
        SecurityProfileLevel.PROFILE_1,
        tlsVersion,
        cipherSuites,
      );

      expect(profile.supportsBasicAuth()).toBe(true);
      expect(profile.isMutualTLS()).toBe(false);
    });

    it('should identify Profile 2 as requiring client certificates', () => {
      const profile = SecurityProfile.create(
        'p2',
        SecurityProfileLevel.PROFILE_2,
        tlsVersion,
        cipherSuites,
      );

      expect(profile.requiresClientCertificate()).toBe(true);
      expect(profile.supportsBasicAuth()).toBe(false);
    });

    it('should identify Profile 3 as mutual TLS', () => {
      const profile = SecurityProfile.create(
        'p3',
        SecurityProfileLevel.PROFILE_3,
        tlsVersion,
        cipherSuites,
      );

      expect(profile.isMutualTLS()).toBe(true);
      expect(profile.requiresServerCertificate()).toBe(true);
    });
  });

  describe('Certificate Pinning', () => {
    it('should enable certificate pinning', () => {
      const profile = SecurityProfile.create(
        'p2',
        SecurityProfileLevel.PROFILE_2,
        tlsVersion,
        cipherSuites,
      );

      expect(profile.isCertificatePinningEnabled()).toBe(false);
      profile.enableCertificatePinning();
      expect(profile.isCertificatePinningEnabled()).toBe(true);
    });

    it('should disable certificate pinning', () => {
      const profile = SecurityProfile.create(
        'p2',
        SecurityProfileLevel.PROFILE_2,
        tlsVersion,
        cipherSuites,
      );

      profile.enableCertificatePinning();
      profile.disableCertificatePinning();
      expect(profile.isCertificatePinningEnabled()).toBe(false);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const profile = SecurityProfile.create(
        'p1',
        SecurityProfileLevel.PROFILE_1,
        tlsVersion,
        cipherSuites,
      );

      const json = profile.toJSON();
      expect(json).toHaveProperty('id', 'p1');
      expect(json).toHaveProperty('level', 1);
      expect(json).toHaveProperty('tlsVersion', '1.2');
      expect(json).toHaveProperty('cipherSuites');
    });

    it('should convert to string', () => {
      const profile = SecurityProfile.create(
        'p1',
        SecurityProfileLevel.PROFILE_1,
        tlsVersion,
        cipherSuites,
      );

      const str = profile.toString();
      expect(str).toContain('SecurityProfile');
      expect(str).toContain('p1');
    });
  });

  describe('Immutability', () => {
    it('should not allow modification of cipher suites array', () => {
      const profile = SecurityProfile.create(
        'p1',
        SecurityProfileLevel.PROFILE_1,
        tlsVersion,
        cipherSuites,
      );

      const suites = profile.getCipherSuites();
      suites.push(CipherSuite.create('TLS_AES_128_GCM_SHA256'));

      expect(profile.getCipherSuites().length).toBe(1);
    });

    it('should not allow modification of dates', () => {
      const profile = SecurityProfile.create(
        'p1',
        SecurityProfileLevel.PROFILE_1,
        tlsVersion,
        cipherSuites,
      );

      const createdAt = profile.getCreatedAt();
      createdAt.setFullYear(2000);

      expect(profile.getCreatedAt().getFullYear()).not.toBe(2000);
    });
  });
});
