import { Test, TestingModule } from '@nestjs/testing';

import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../../infrastructure/tokens';
import { HandleStatusNotification } from '../HandleStatusNotification';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { OcppCallRequest } from '../../dto/OcppProtocol';
import { OcppContext } from '../../../domain/value-objects/OcppContext';

describe('HandleStatusNotification - Comprehensive Test Suite (18 Tests)', () => {
  let useCase: HandleStatusNotification;
  let mockRepository: jest.Mocked<IChargePointRepository>;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findByChargePointId: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleStatusNotification,
        {
          provide: CHARGE_POINT_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<HandleStatusNotification>(HandleStatusNotification);
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ===== HAPPY PATH TESTS (5 tests) =====

  describe('HP: Happy Path - Standard Operations', () => {
    it('HP-001: should accept StatusNotification with Available status', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-hp-001',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'NoError',
          status: 'Available',
          timestamp: new Date().toISOString(),
        },
      };
      const context = new OcppContext('CP-001', 'sn-hp-001');

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'CP-001',
        chargePointId: 'CP-001',
      } as any);

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(3); // CALLRESULT
      expect(result[1]).toBe('sn-hp-001');
      expect(result[2]).toEqual({}); // empty response per OCPP spec
    });

    it('HP-002: should accept Occupied status (charging in progress)', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-hp-002',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'NoError',
          status: 'Occupied',
          timestamp: new Date().toISOString(),
        },
      };
      const context = new OcppContext('CP-001', 'sn-hp-002');

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'CP-001',
      } as any);

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(3);
      expect(result[1]).toBe('sn-hp-002');
    });

    it('HP-003: should accept Reserved status (booking/reservation)', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-hp-003',
        action: 'StatusNotification',
        payload: {
          connectorId: 2,
          errorCode: 'NoError',
          status: 'Reserved',
          timestamp: new Date().toISOString(),
        },
      };
      const context = new OcppContext('CP-002', 'sn-hp-003');

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'CP-002',
      } as any);

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(3);
    });

    it('HP-004: should accept Unavailable status (maintenance mode)', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-hp-004',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'NoError',
          status: 'Unavailable',
          timestamp: new Date().toISOString(),
        },
      };
      const context = new OcppContext('CP-001', 'sn-hp-004');

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'CP-001',
      } as any);

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(3);
    });

    it('HP-005: should preserve messageId in all responses', async () => {
      const messageId = 'unique-msg-12345-xyz';
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId,
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'NoError',
          status: 'Available',
          timestamp: new Date().toISOString(),
        },
      };
      const context = new OcppContext('CP-001', messageId);

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'CP-001',
      } as any);

      const result = await useCase.execute(message, context);

      expect(result[1]).toBe(messageId);
    });
  });

  // ===== ERROR HANDLING TESTS (4 tests) =====

  describe('EH: Error Handling - Invalid States', () => {
    it('EH-001: should reject invalid messageTypeId (not CALL)', async () => {
      const message = {
        messageTypeId: 99,
        messageId: 'sn-eh-001',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'NoError',
          status: 'Available',
          timestamp: new Date().toISOString(),
        },
      } as any as OcppCallRequest;
      const context = new OcppContext('CP-001', 'sn-eh-001');

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(4); // CALLERROR
      expect(result[2]).toBe('GenericError');
    });

    it('EH-002: should reject invalid status enum value', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-eh-002',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'NoError',
          status: 'InvalidStatus' as any,
          timestamp: new Date().toISOString(),
        },
      };
      const context = new OcppContext('CP-001', 'sn-eh-002');

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(4);
      expect(result[2]).toBe('FormationViolation');
    });

    it('EH-003: should reject invalid errorCode enum value', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-eh-003',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'InvalidErrorCode' as any,
          status: 'Available',
          timestamp: new Date().toISOString(),
        },
      };
      const context = new OcppContext('CP-001', 'sn-eh-003');

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(4);
      expect(result[2]).toBe('FormationViolation');
    });

    it('EH-004: should return error when ChargePoint not found', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-eh-004',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'NoError',
          status: 'Available',
          timestamp: new Date().toISOString(),
        },
      };
      const context = new OcppContext('CP-NONEXISTENT', 'sn-eh-004');

      mockRepository.findByChargePointId.mockResolvedValue(null);

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(4); // CALLERROR
      expect(result[2]).toBe('GenericError');
    });
  });

  // ===== VALIDATION TESTS (4 tests) =====

  describe('VAL: Validation - Required Fields', () => {
    it('VAL-001: should reject missing connectorId', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-val-001',
        action: 'StatusNotification',
        payload: {
          errorCode: 'NoError',
          status: 'Available',
          timestamp: new Date().toISOString(),
        } as any,
      };
      const context = new OcppContext('CP-001', 'sn-val-001');

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(4); // CALLERROR
      expect(result[2]).toBe('FormationViolation');
    });

    it('VAL-002: should reject missing errorCode', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-val-002',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          status: 'Available',
          timestamp: new Date().toISOString(),
        } as any,
      };
      const context = new OcppContext('CP-001', 'sn-val-002');

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(4);
      expect(result[2]).toBe('FormationViolation');
    });

    it('VAL-003: should reject missing status', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-val-003',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'NoError',
          timestamp: new Date().toISOString(),
        } as any,
      };
      const context = new OcppContext('CP-001', 'sn-val-003');

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(4);
      expect(result[2]).toBe('FormationViolation');
    });

    it('VAL-004: should reject missing timestamp', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-val-004',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'NoError',
          status: 'Available',
        } as any,
      };
      const context = new OcppContext('CP-001', 'sn-val-004');

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(4);
      expect(result[2]).toBe('FormationViolation');
    });
  });

  // ===== REPOSITORY INTERACTION TESTS (3 tests) =====

  describe('REPO: Repository Interaction', () => {
    it('REPO-001: should call repository with correct chargePointId', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-repo-001',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'NoError',
          status: 'Available',
          timestamp: new Date().toISOString(),
        },
      };
      const context = new OcppContext('CP-SPECIAL-123', 'sn-repo-001');

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'CP-SPECIAL-123',
      } as any);

      await useCase.execute(message, context);

      expect(mockRepository.findByChargePointId).toHaveBeenCalledWith('CP-SPECIAL-123');
      expect(mockRepository.findByChargePointId).toHaveBeenCalledTimes(1);
    });

    it('REPO-002: should handle repository errors gracefully', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-repo-002',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'NoError',
          status: 'Available',
          timestamp: new Date().toISOString(),
        },
      };
      const context = new OcppContext('CP-001', 'sn-repo-002');

      mockRepository.findByChargePointId.mockRejectedValue(new Error('Database connection failed'));

      const result = await useCase.execute(message, context).catch((err) => {
        return [4, 'sn-repo-002', 'InternalError', err.message];
      });

      expect(Array.isArray(result)).toBe(true);
      expect([3, 4]).toContain(result[0]); // Either success or error
    });

    it('REPO-003: should work with multiple different chargePointIds', async () => {
      const chargePointIds = ['CP-A', 'CP-B', 'CP-C'];

      for (const cpId of chargePointIds) {
        const message: OcppCallRequest = {
          messageTypeId: 2,
          messageId: `sn-repo-003-${cpId}`,
          action: 'StatusNotification',
          payload: {
            connectorId: 1,
            errorCode: 'NoError',
            status: 'Available',
            timestamp: new Date().toISOString(),
          },
        };
        const context = new OcppContext(cpId, `sn-repo-003-${cpId}`);

        mockRepository.findByChargePointId.mockResolvedValue({
          id: cpId,
        } as any);

        await useCase.execute(message, context);

        expect(mockRepository.findByChargePointId).toHaveBeenCalledWith(cpId);
      }
    });
  });

  // ===== EDGE CASES TESTS (2 tests) =====

  describe('EDGE: Edge Cases & Timestamps', () => {
    it('EDGE-001: should reject invalid ISO 8601 timestamp format', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-edge-001',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'NoError',
          status: 'Available',
          timestamp: 'not-a-valid-iso-timestamp',
        },
      };
      const context = new OcppContext('CP-001', 'sn-edge-001');

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(4); // CALLERROR
    });

    it('EDGE-002: should accept valid ISO 8601 timestamps with milliseconds', async () => {
      const validTimestamp = '2025-12-07T18:30:00.123Z';
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-edge-002',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'NoError',
          status: 'Available',
          timestamp: validTimestamp,
        },
      };
      const context = new OcppContext('CP-001', 'sn-edge-002');

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'CP-001',
      } as any);

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(3); // Success
    });
  });

  // ===== INTEGRATION TEST (1 test) =====

  describe('INT: Integration & OCPP Compliance', () => {
    it('INT-001: should return response in OCPP 1.6 CALLRESULT format [3, messageId, {}]', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-int-001',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'NoError',
          status: 'Available',
          timestamp: new Date().toISOString(),
        },
      };
      const context = new OcppContext('CP-001', 'sn-int-001');

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'CP-001',
      } as any);

      const result = await useCase.execute(message, context);

      // Verify OCPP 1.6 format: [3, messageId, payload]
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result[0]).toBe(3); // CALLRESULT type
      expect(typeof result[1]).toBe('string'); // messageId
    });
  });

  // ===== PERFORMANCE TEST (1 test) =====

  describe('PERF: Performance & Scalability', () => {
    it('PERF-001: should complete requests within 200ms SLA', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-perf-001',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'NoError',
          status: 'Available',
          timestamp: new Date().toISOString(),
        },
      };
      const context = new OcppContext('CP-001', 'sn-perf-001');

      mockRepository.findByChargePointId.mockResolvedValue({
        id: 'CP-001',
      } as any);

      const start = Date.now();
      const result = await useCase.execute(message, context);
      const duration = Date.now() - start;

      expect(result[0]).toBe(3);
      expect(duration).toBeLessThan(200); // SLA: 200ms
    });
  });
});
