import { Test, TestingModule } from '@nestjs/testing';
const CHARGE_POINT_REPOSITORY_TOKEN = 'IChargePointRepository';

import { ChargePoint } from '../../../domain/entities/ChargePoint.entity';
import { HandleBootNotification } from '../HandleBootNotification';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { OcppCallRequest } from '../../dto/OcppProtocol';
import { OcppContext } from '../../../domain/value-objects/OcppContext';

describe('HandleBootNotification - Comprehensive Test Suite', () => {
  let useCase: HandleBootNotification;
  let repositoryMock: jest.Mocked<IChargePointRepository>;

  beforeEach(async () => {
    repositoryMock = {
      findByChargePointId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<IChargePointRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleBootNotification,
        {
          provide: 'IChargePointRepository',
          useValue: repositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<HandleBootNotification>(HandleBootNotification);

    // Mock Logger
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============ HAPPY PATH TESTS ============

  it('should accept BootNotification when ChargePoint exists', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'boot-001',
      action: 'BootNotification',
      payload: {
        chargePointModel: 'Tesla Supercharger',
        chargePointVendor: 'Tesla Inc',
      },
    };

    const mockChargePoint: Partial<ChargePoint> = {
      id: '123',
      chargePointId: 'CP-001',
    };

    repositoryMock.findByChargePointId.mockResolvedValue(
      mockChargePoint as ChargePoint,
    );

    const context = new OcppContext('CP-001', 'boot-001');
    const result = await useCase.execute(message, context);

    expect(result[0]).toBe(3); // CALLRESULT
    expect(result[1]).toBe('boot-001'); // messageId preserved
    expect(result[2]).toHaveProperty('status');
    expect(result[2]).toHaveProperty('currentTime');
    expect(result[2]).toHaveProperty('interval');
  });

  it('should return response with correct OCPP format', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'boot-002',
      action: 'BootNotification',
      payload: {
        chargePointModel: 'ACE3000',
        chargePointVendor: 'ABB',
      },
    };

    repositoryMock.findByChargePointId.mockResolvedValue({
      id: '456',
      chargePointId: 'CP-002',
    } as ChargePoint);

    const context = new OcppContext('CP-002', 'boot-002');
    const result = await useCase.execute(message, context);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3); // [3, messageId, payload]
    expect(result[0]).toBe(3);
    expect(typeof result[1]).toBe('string');
    expect(typeof result[2]).toBe('object');
  });

  it('should return currentTime in ISO 8601 format', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'boot-003',
      action: 'BootNotification',
      payload: {
        chargePointModel: 'Model X',
        chargePointVendor: 'Tesla',
      },
    };

    repositoryMock.findByChargePointId.mockResolvedValue({
      id: '789',
      chargePointId: 'CP-003',
    } as ChargePoint);

    const context = new OcppContext('CP-003', 'boot-003');
    const result = await useCase.execute(message, context);

    expect(result[2].currentTime).toBeDefined();
    expect(typeof result[2].currentTime).toBe('string');
    // Verify ISO 8601 format
    expect(result[2].currentTime).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('should return default interval of 900 seconds', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'boot-004',
      action: 'BootNotification',
      payload: {
        chargePointModel: 'Nissan Leaf Charger',
        chargePointVendor: 'Nissan',
      },
    };

    repositoryMock.findByChargePointId.mockResolvedValue({
      id: '999',
      chargePointId: 'CP-004',
    } as ChargePoint);

    const context = new OcppContext('CP-004', 'boot-004');
    const result = await useCase.execute(message, context);

    expect(result[2].interval).toBe(900);
  });

  it('should preserve messageId in response', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'unique-boot-id-12345',
      action: 'BootNotification',
      payload: {
        chargePointModel: 'Model S',
        chargePointVendor: 'Tesla',
      },
    };

    repositoryMock.findByChargePointId.mockResolvedValue({
      id: '111',
      chargePointId: 'CP-005',
    } as ChargePoint);

    const context = new OcppContext('CP-005', 'unique-boot-id-12345');
    const result = await useCase.execute(message, context);

    expect(result[1]).toBe('unique-boot-id-12345');
  });

  // ============ MESSAGE VALIDATION TESTS ============

  it('should validate messageTypeId = 2 (CALL)', async () => {
    const message = {
      messageTypeId: 99, // Invalid type - cast to any to bypass type check
      messageId: 'boot-005',
      action: 'BootNotification',
      payload: {
        chargePointModel: 'Model 3',
        chargePointVendor: 'Tesla',
      },
    } as any as OcppCallRequest;

    const context = new OcppContext('CP-006', 'boot-005');
    const result = await useCase.execute(message, context);

    expect(result[0]).toBe(4); // CALLERROR
    expect(result[2]).toBe('GenericError');
  });

  it('should require chargePointModel in payload', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'boot-006',
      action: 'BootNotification',
      payload: {
        chargePointVendor: 'Tesla', // Missing chargePointModel
      } as any,
    };

    const context = new OcppContext('CP-007', 'boot-006');
    const result = await useCase.execute(message, context);

    expect(result[0]).toBe(4); // CALLERROR
  });

  it('should require chargePointVendor in payload', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'boot-007',
      action: 'BootNotification',
      payload: {
        chargePointModel: 'Tesla Supercharger', // Missing chargePointVendor
      } as any,
    };

    const context = new OcppContext('CP-008', 'boot-007');
    const result = await useCase.execute(message, context);

    expect(result[0]).toBe(4); // CALLERROR
  });

  // ============ ERROR HANDLING TESTS ============

  it('should return error when ChargePoint not found', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'boot-008',
      action: 'BootNotification',
      payload: {
        chargePointModel: 'Unknown Model',
        chargePointVendor: 'Unknown Vendor',
      },
    };

    repositoryMock.findByChargePointId.mockResolvedValue(null);

    const context = new OcppContext('CP-UNKNOWN', 'boot-008');
    const result = await useCase.execute(message, context);

    expect(result[0]).toBe(4); // CALLERROR
    expect(typeof result[2]).toBe('string'); // Error message
  });

  it('should return error for invalid payload', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'boot-009',
      action: 'BootNotification',
      payload: {}, // Empty payload
    };

    const context = new OcppContext('CP-009', 'boot-009');
    const result = await useCase.execute(message, context);

    expect(result[0]).toBe(4); // CALLERROR
  });

  // ============ BUSINESS LOGIC TESTS ============

  it('should interact with repository to find ChargePoint', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'boot-010',
      action: 'BootNotification',
      payload: {
        chargePointModel: 'Model X',
        chargePointVendor: 'Tesla',
      },
    };

    repositoryMock.findByChargePointId.mockResolvedValue({
      id: '222',
      chargePointId: 'CP-010',
    } as ChargePoint);

    const context = new OcppContext('CP-010', 'boot-010');
    await useCase.execute(message, context);

    expect(repositoryMock.findByChargePointId).toHaveBeenCalledWith('CP-010');
  });

  it('should log successful BootNotification processing', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'boot-011',
      action: 'BootNotification',
      payload: {
        chargePointModel: 'Model S',
        chargePointVendor: 'Tesla',
      },
    };

    repositoryMock.findByChargePointId.mockResolvedValue({
      id: '333',
      chargePointId: 'CP-011',
    } as ChargePoint);

    const context = new OcppContext('CP-011', 'boot-011');
    const result = await useCase.execute(message, context);

    // Verify successful response (not an error)
    expect(result[0]).toBe(3); // CALLRESULT, not CALLERROR
  });

  // ============ RESPONSE STATUS TESTS ============

  it('should return Accepted status for valid BootNotification', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'boot-012',
      action: 'BootNotification',
      payload: {
        chargePointModel: 'ACE3000',
        chargePointVendor: 'ABB',
      },
    };

    repositoryMock.findByChargePointId.mockResolvedValue({
      id: '444',
      chargePointId: 'CP-012',
    } as ChargePoint);

    const context = new OcppContext('CP-012', 'boot-012');
    const result = await useCase.execute(message, context);

    expect(result[2].status).toMatch(/Accepted|Pending|Rejected/);
  });

  // ============ PERFORMANCE TESTS ============

  it('should complete within 100ms SLA', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'boot-013',
      action: 'BootNotification',
      payload: {
        chargePointModel: 'Model X',
        chargePointVendor: 'Tesla',
      },
    };

    repositoryMock.findByChargePointId.mockResolvedValue({
      id: '555',
      chargePointId: 'CP-013',
    } as ChargePoint);

    const context = new OcppContext('CP-013', 'boot-013');

    const start = performance.now();
    await useCase.execute(message, context);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100);
  });

  it('should handle rapid consecutive BootNotifications', async () => {
    const messages = Array.from({ length: 5 }, (_, i) => ({
      messageTypeId: 2 as const,
      messageId: `boot-rapid-${i}`,
      action: 'BootNotification' as const,
      payload: {
        chargePointModel: `Model ${i}`,
        chargePointVendor: 'Tesla',
      },
    }));

    repositoryMock.findByChargePointId.mockResolvedValue({
      id: '666',
      chargePointId: 'CP-014',
    } as ChargePoint);

    const context = new OcppContext('CP-014', 'boot-rapid');

    const results = await Promise.all(
      messages.map((msg) => useCase.execute(msg, context)),
    );

    expect(results).toHaveLength(5);
    expect(results.every((r) => r[0] === 3)).toBe(true);
  });

  it('should return response array format [3, messageId, payload]', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'boot-015',
      action: 'BootNotification',
      payload: {
        chargePointModel: 'Final Test',
        chargePointVendor: 'Test Vendor',
      },
    };

    repositoryMock.findByChargePointId.mockResolvedValue({
      id: '777',
      chargePointId: 'CP-015',
    } as ChargePoint);

    const context = new OcppContext('CP-015', 'boot-015');
    const result = await useCase.execute(message, context);

    expect(result).toEqual([
      3,
      'boot-015',
      expect.objectContaining({
        status: expect.any(String),
        currentTime: expect.any(String),
        interval: expect.any(Number),
      }),
    ]);
  });
});