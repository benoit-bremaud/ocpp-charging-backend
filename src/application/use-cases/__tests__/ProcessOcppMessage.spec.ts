import { Test, TestingModule } from '@nestjs/testing';
import { ProcessOcppMessage } from '../ProcessOcppMessage';
import { HandleBootNotification } from '../HandleBootNotification';
import { HandleHeartbeat } from '../HandleHeartbeat';
import { HandleStatusNotification } from '../HandleStatusNotification';
import { OcppMessageInput } from '../../dto/OcppMessageInput';

describe('ProcessOcppMessage Use-Case (Handler Registry)', () => {
  let useCase: ProcessOcppMessage;
  let bootNotifMock: { execute: jest.Mock };
  let heartbeatMock: { execute: jest.Mock };
  let statusNotifMock: { execute: jest.Mock };

  beforeEach(async () => {
    bootNotifMock = { execute: jest.fn() };
    heartbeatMock = { execute: jest.fn() };
    statusNotifMock = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessOcppMessage,
        {
          provide: HandleBootNotification,
          useValue: bootNotifMock,
        },
        {
          provide: HandleHeartbeat,
          useValue: heartbeatMock,
        },
        {
          provide: HandleStatusNotification,
          useValue: statusNotifMock,
        },
      ],
    }).compile();

    useCase = module.get<ProcessOcppMessage>(ProcessOcppMessage);

    // Mock Logger
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should route BootNotification to correct handler', async () => {
    const input: OcppMessageInput = {
      messageTypeId: 2,
      messageId: 'msg-001',
      action: 'BootNotification',
      payload: {
        chargePointModel: 'Tesla',
        chargePointVendor: 'Tesla Inc',
      },
    };

    const expectedResponse = [3, 'msg-001', { status: 'Accepted' }];
    bootNotifMock.execute.mockResolvedValue(expectedResponse);

    const result = await useCase.execute(input, 'CP-001');

    expect(bootNotifMock.execute).toHaveBeenCalled();
    expect(result).toEqual(expectedResponse);
  });

  it('should route Heartbeat to correct handler', async () => {
    const input: OcppMessageInput = {
      messageTypeId: 2,
      messageId: 'msg-002',
      action: 'Heartbeat',
      payload: {},
    };

    const expectedResponse = [
      3,
      'msg-002',
      { currentTime: '2025-12-05T17:38:00Z' },
    ];
    heartbeatMock.execute.mockResolvedValue(expectedResponse);

    const result = await useCase.execute(input, 'CP-001');

    expect(heartbeatMock.execute).toHaveBeenCalled();
    expect(result).toEqual(expectedResponse);
  });

  it('should route StatusNotification to correct handler', async () => {
    const input: OcppMessageInput = {
      messageTypeId: 2,
      messageId: 'msg-003',
      action: 'StatusNotification',
      payload: {
        connectorId: 1,
        errorCode: 'NoError',
        status: 'Available',
        timestamp: '2025-12-05T17:38:00Z',
      },
    };

    const expectedResponse = [3, 'msg-003', {}];
    statusNotifMock.execute.mockResolvedValue(expectedResponse);

    const result = await useCase.execute(input, 'CP-001');

    expect(statusNotifMock.execute).toHaveBeenCalled();
    expect(result).toEqual(expectedResponse);
  });

  it('should return NotImplemented for unknown action', async () => {
    const input: OcppMessageInput = {
      messageTypeId: 2,
      messageId: 'msg-004',
      action: 'UnknownAction',
      payload: {},
    };

    const result = await useCase.execute(input, 'CP-001');

    expect(result).toEqual([
      4,
      'msg-004',
      'NotImplemented',
      'Handler for UnknownAction not implemented',
    ]);
  });

  it('should ignore non-CALL messages', async () => {
    const input: OcppMessageInput = {
      messageTypeId: 3, // CALLRESULT
      messageId: 'msg-005',
      action: 'BootNotification',
      payload: {},
    };

    const result = await useCase.execute(input, 'CP-001');

    expect(result).toEqual({ status: 'ignored' });
    expect(bootNotifMock.execute).not.toHaveBeenCalled();
  });

  it('should catch handler exceptions and return InternalError', async () => {
    const input: OcppMessageInput = {
      messageTypeId: 2,
      messageId: 'msg-006',
      action: 'Heartbeat',
      payload: {},
    };

    heartbeatMock.execute.mockRejectedValue(
      new Error('Database connection failed'),
    );

    const result = await useCase.execute(input, 'CP-001');

    expect(result[0]).toBe(4); // CALLERROR
    expect(result[2]).toBe('InternalError');
    expect(result[3]).toContain('Database connection failed');
  });
});
