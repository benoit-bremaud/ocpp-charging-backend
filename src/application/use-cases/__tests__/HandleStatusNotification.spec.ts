import { Test, TestingModule } from '@nestjs/testing';

import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../../infrastructure/tokens';
import { HandleStatusNotification } from '../HandleStatusNotification';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { OcppCallRequest } from '../../dto/OcppProtocol';
import { OcppContext } from '../../../domain/value-objects/OcppContext';

describe('HandleStatusNotification (Expanded Coverage)', () => {
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
  });

  // ===== EXISTING TESTS (Keep as-is) =====

  it('should accept StatusNotification with NoError', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'sn-001',
      action: 'StatusNotification',
      payload: {
        connectorId: 1,
        errorCode: 'NoError',
        status: 'Available',
        timestamp: new Date().toISOString(),
      },
    };

    const context = new OcppContext('CP-001', 'sn-001');
    mockRepository.findByChargePointId.mockResolvedValue({ id: 'CP-001' } as any);

    const result = await useCase.execute(message, context);

    expect(result[0]).toBe(3); // CALLRESULT
    expect(result[1]).toBe('sn-001');
  });

  it('should accept StatusNotification with error status', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'sn-002',
      action: 'StatusNotification',
      payload: {
        connectorId: 1,
        errorCode: 'NoError',
        status: 'Faulted',
        timestamp: new Date().toISOString(),
      },
    };

    const context = new OcppContext('CP-001', 'sn-002');
    mockRepository.findByChargePointId.mockResolvedValue({ id: 'CP-001' } as any);

    const result = await useCase.execute(message, context);

    expect(result[0]).toBe(3); // CALLRESULT
  });

  it('should reject when ChargePoint not found', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'sn-003',
      action: 'StatusNotification',
      payload: {
        connectorId: 1,
        errorCode: 'NoError',
        status: 'Available',
        timestamp: new Date().toISOString(),
      },
    };

    const context = new OcppContext('CP-NONEXISTENT', 'sn-003');
    mockRepository.findByChargePointId.mockResolvedValue(null);

    const result = await useCase.execute(message, context);

    expect(result[0]).toBe(4); // CALLERROR
  });

  it('should validate payload schema', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'sn-004',
      action: 'StatusNotification',
      payload: {}, // Missing required fields
    };

    const context = new OcppContext('CP-001', 'sn-004');
    mockRepository.findByChargePointId.mockResolvedValue({ id: 'CP-001' } as any);

    const result = await useCase.execute(message, context);

    expect(result[0]).toBe(4); // CALLERROR
    expect(result[2]).toBe('FormationViolation');
  });

  // ===== NEW TESTS: HAPPY PATH VARIATIONS =====

  describe('Happy Path: Connector States', () => {
    it('should accept "Occupied" status (connector in use)', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-005',
        action: 'StatusNotification',
        payload: {
          connectorId: 2,
          errorCode: 'NoError',
          status: 'Occupied',
          timestamp: new Date().toISOString(),
        },
      };

      const context = new OcppContext('CP-002', 'sn-005');
      mockRepository.findByChargePointId.mockResolvedValue({ id: 'CP-002' } as any);

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(3);
      expect(result[1]).toBe('sn-005');
    });

    it('should accept "Reserved" status (booking in progress)', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-006',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'NoError',
          status: 'Reserved',
          timestamp: new Date().toISOString(),
        },
      };

      const context = new OcppContext('CP-001', 'sn-006');
      mockRepository.findByChargePointId.mockResolvedValue({ id: 'CP-001' } as any);

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(3);
    });

    it('should accept "Unavailable" status (maintenance mode)', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-007',
        action: 'StatusNotification',
        payload: {
          connectorId: 3,
          errorCode: 'NoError',
          status: 'Unavailable',
          timestamp: new Date().toISOString(),
        },
      };

      const context = new OcppContext('CP-003', 'sn-007');
      mockRepository.findByChargePointId.mockResolvedValue({ id: 'CP-003' } as any);

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(3);
    });
  });

  // ===== NEW TESTS: ERROR CODE VARIATIONS =====

  describe('Happy Path: Error Codes', () => {
    it('should accept "HighTemperature" error code', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-008',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'HighTemperature',
          status: 'Unavailable',
          timestamp: new Date().toISOString(),
        },
      };

      const context = new OcppContext('CP-001', 'sn-008');
      mockRepository.findByChargePointId.mockResolvedValue({ id: 'CP-001' } as any);

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(3);
    });

    it('should accept "WeakSignal" error code', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-009',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'WeakSignal',
          status: 'Available',
          timestamp: new Date().toISOString(),
        },
      };

      const context = new OcppContext('CP-001', 'sn-009');
      mockRepository.findByChargePointId.mockResolvedValue({ id: 'CP-001' } as any);

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(3);
    });

    it('should accept "OverCurrentFailure" error code', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-010',
        action: 'StatusNotification',
        payload: {
          connectorId: 2,
          errorCode: 'OverCurrentFailure',
          status: 'Faulted',
          timestamp: new Date().toISOString(),
        },
      };

      const context = new OcppContext('CP-002', 'sn-010');
      mockRepository.findByChargePointId.mockResolvedValue({ id: 'CP-002' } as any);

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(3);
    });
  });

  // ===== NEW TESTS: VALIDATION EDGE CASES =====

  describe('Validation: Missing Required Fields', () => {
    it('should reject missing connectorId', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-011',
        action: 'StatusNotification',
        payload: {
          // missing connectorId
          errorCode: 'NoError',
          status: 'Available',
          timestamp: new Date().toISOString(),
        },
      };

      const context = new OcppContext('CP-001', 'sn-011');
      mockRepository.findByChargePointId.mockResolvedValue({ id: 'CP-001' } as any);

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(4); // CALLERROR
      expect(result[2]).toBe('FormationViolation');
    });

    it('should reject missing errorCode', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-012',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          // missing errorCode
          status: 'Available',
          timestamp: new Date().toISOString(),
        },
      };

      const context = new OcppContext('CP-001', 'sn-012');
      mockRepository.findByChargePointId.mockResolvedValue({ id: 'CP-001' } as any);

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(4);
      expect(result[2]).toBe('FormationViolation');
    });

    it('should reject missing status', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-013',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'NoError',
          // missing status
          timestamp: new Date().toISOString(),
        },
      };

      const context = new OcppContext('CP-001', 'sn-013');
      mockRepository.findByChargePointId.mockResolvedValue({ id: 'CP-001' } as any);

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(4);
      expect(result[2]).toBe('FormationViolation');
    });
  });

  // ===== NEW TESTS: INVALID MESSAGE TYPE =====

  describe('Error Handling: Invalid Message Types', () => {
    it('should reject non-CALL message (messageTypeId != 2)', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 3, // CALLRESULT instead of CALL
        messageId: 'sn-014',
        action: 'StatusNotification',
        payload: {
          connectorId: 1,
          errorCode: 'NoError',
          status: 'Available',
          timestamp: new Date().toISOString(),
        },
      } as any;

      const context = new OcppContext('CP-001', 'sn-014');

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(4);
      expect(result[2]).toBe('GenericError');
    });
  });

  // ===== NEW TESTS: MULTIPLE CONNECTORS =====

  describe('Happy Path: Multiple Connectors', () => {
    it('should handle status from connector 0 (charger global)', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-015',
        action: 'StatusNotification',
        payload: {
          connectorId: 0, // Global charger status
          errorCode: 'NoError',
          status: 'Available',
          timestamp: new Date().toISOString(),
        },
      };

      const context = new OcppContext('CP-001', 'sn-015');
      mockRepository.findByChargePointId.mockResolvedValue({ id: 'CP-001' } as any);

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(3);
    });

    it('should handle status from high connector ID', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sn-016',
        action: 'StatusNotification',
        payload: {
          connectorId: 99, // Many outlet charger
          errorCode: 'NoError',
          status: 'Available',
          timestamp: new Date().toISOString(),
        },
      };

      const context = new OcppContext('CP-001', 'sn-016');
      mockRepository.findByChargePointId.mockResolvedValue({ id: 'CP-001' } as any);

      const result = await useCase.execute(message, context);

      expect(result[0]).toBe(3);
    });
  });
});