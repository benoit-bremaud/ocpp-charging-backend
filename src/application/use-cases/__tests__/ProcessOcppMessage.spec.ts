import { Test, TestingModule } from '@nestjs/testing';
import { ProcessOcppMessage } from '../ProcessOcppMessage';
import { HandleBootNotification } from '../HandleBootNotification';
import { HandleHeartbeat } from '../HandleHeartbeat';
import { HandleStatusNotification } from '../HandleStatusNotification';
import { OcppContext } from '../../../domain/value-objects/OcppContext';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../../infrastructure/tokens';

describe('ProcessOcppMessage', () => {
  let useCase: ProcessOcppMessage;
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
        ProcessOcppMessage,
        HandleBootNotification,
        HandleHeartbeat,
        HandleStatusNotification,
        {
          provide: CHARGE_POINT_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<ProcessOcppMessage>(ProcessOcppMessage);
  });

  it('should route BootNotification to handler', async () => {
    const rawMessage = [
      2,
      'msg-001',
      'BootNotification',
      {
        chargePointVendor: 'TestVendor',
        chargePointModel: 'Model-X',
      },
    ];

    const context = new OcppContext('CP-001', 'msg-001');
    mockRepository.findByChargePointId.mockResolvedValue({ id: 'CP-001' } as any);

    const result = (await useCase.execute(rawMessage, context)) as any[];

    expect(result[0]).toBe(3); // CALLRESULT
  });

  it('should route Heartbeat to handler', async () => {
    const rawMessage = [2, 'msg-002', 'Heartbeat', {}];
    const context = new OcppContext('CP-001', 'msg-002');

    const result = (await useCase.execute(rawMessage, context)) as any[];

    expect(result[0]).toBe(3); // CALLRESULT
  });

  it('should route StatusNotification to handler', async () => {
    const rawMessage = [
      2,
      'msg-003',
      'StatusNotification',
      {
        connectorId: 1,
        errorCode: 'NoError',
        status: 'Available',
        timestamp: new Date().toISOString(),
      },
    ];

    const context = new OcppContext('CP-001', 'msg-003');
    mockRepository.findByChargePointId.mockResolvedValue({ id: 'CP-001' } as any);

    const result = (await useCase.execute(rawMessage, context)) as any[];

    expect(result[0]).toBe(3); // CALLRESULT
  });

  it('should return NotImplemented for unknown action', async () => {
    const rawMessage = [2, 'msg-004', 'UnknownAction', {}];
    const context = new OcppContext('CP-001', 'msg-004');

    const result = (await useCase.execute(rawMessage, context)) as any[];

    expect(result[0]).toBe(4); // CALLERROR
    expect(result[2]).toBe('NotImplemented');
  });

  it('should ignore non-CALL messages', async () => {
    const rawMessage = [3, 'msg-005', {}]; // CALLRESULT
    const context = new OcppContext('CP-001', 'msg-005');

    const result = await useCase.execute(rawMessage, context);

    expect(result).toEqual({ status: 'ignored' });
  });

  it('should handle database errors gracefully', async () => {
    const rawMessage = [
      2,
      'msg-006',
      'BootNotification',
      {
        chargePointVendor: 'TestVendor',
        chargePointModel: 'Model-X',
      },
    ];

    const context = new OcppContext('CP-001', 'msg-006');
    mockRepository.findByChargePointId.mockRejectedValue(new Error('Database connection failed'));

    const result = (await useCase.execute(rawMessage, context)) as any[];

    expect(result[0]).toBe(4); // CALLERROR
    expect(result[2]).toBe('InternalError');
  });
});
