import { Test, TestingModule } from '@nestjs/testing';
import { HandleBootNotification } from '../HandleBootNotification';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { OcppContext } from '../../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../../dto/OcppProtocol';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../../infrastructure/tokens';

describe('HandleBootNotification', () => {
  let useCase: HandleBootNotification;
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
        HandleBootNotification,
        {
          provide: CHARGE_POINT_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<HandleBootNotification>(HandleBootNotification);
  });

  it('should accept BootNotification when ChargePoint exists', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'msg-001',
      action: 'BootNotification',
      payload: {
        chargePointVendor: 'TestVendor',
        chargePointModel: 'Model-X',
      },
    };

    const context = new OcppContext('CP-001', 'msg-001');

    mockRepository.findByChargePointId.mockResolvedValue({ id: 'CP-001' } as any);

    const result = await useCase.execute(message, context);

    expect(result).toEqual([
      3,
      'msg-001',
      expect.objectContaining({
        status: 'Accepted',
      }),
    ]);
  });

  it('should reject when ChargePoint not found', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'msg-002',
      action: 'BootNotification',
      payload: {
        chargePointVendor: 'TestVendor',
        chargePointModel: 'Model-X',
      },
    };

    const context = new OcppContext('CP-NONEXISTENT', 'msg-002');

    mockRepository.findByChargePointId.mockResolvedValue(null);

    const result = await useCase.execute(message, context);

    expect(result[0]).toBe(4); // CALLERROR
    expect(result[2]).toBe('GenericError');
  });

  it('should return error for invalid payload', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'msg-003',
      action: 'BootNotification',
      payload: {}, // Missing required fields
    };

    const context = new OcppContext('CP-001', 'msg-003');

    mockRepository.findByChargePointId.mockResolvedValue({ id: 'CP-001' } as any);

    const result = await useCase.execute(message, context);

    expect(result[0]).toBe(4); // CALLERROR
    expect(result[2]).toBe('FormationViolation');
  });
});
