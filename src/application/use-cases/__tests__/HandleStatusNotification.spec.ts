import { Test, TestingModule } from '@nestjs/testing';
import { HandleStatusNotification } from '../HandleStatusNotification';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { OcppContext } from '../../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../../dto/OcppProtocol';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../../infrastructure/tokens';

describe('HandleStatusNotification', () => {
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
        errorCode: 'NoError', // Keep this as NoError for valid schema
        status: 'Faulted', // But status is Faulted
        timestamp: new Date().toISOString(),
      },
    };

    const context = new OcppContext('CP-001', 'sn-002');
    mockRepository.findByChargePointId.mockResolvedValue({ id: 'CP-001' } as any);

    const result = await useCase.execute(message, context);

    expect(result[0]).toBe(3); // CALLRESULT (still accepted)
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
});
