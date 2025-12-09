import { Test, TestingModule } from '@nestjs/testing';
import { ProcessOcppMessage } from '../ProcessOcppMessage';
import { HandleBootNotification } from '../HandleBootNotification';
import { HandleHeartbeat } from '../HandleHeartbeat';
import { HandleStatusNotification } from '../HandleStatusNotification';
import { HandleAuthorize } from '../HandleAuthorize';

describe('ProcessOcppMessage', () => {
  let service: ProcessOcppMessage;

  beforeEach(async () => {
    const mockHandlerBootNotification = {
      execute: jest.fn(),
    };
    const mockHandlerHeartbeat = {
      execute: jest.fn(),
    };
    const mockHandlerStatusNotification = {
      execute: jest.fn(),
    };
    const mockHandlerAuthorize = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessOcppMessage,
        HandleBootNotification,
        HandleHeartbeat,
        HandleStatusNotification,
        HandleAuthorize,
        {
          provide: HandleBootNotification,
          useValue: mockHandlerBootNotification,
        },
        {
          provide: HandleHeartbeat,
          useValue: mockHandlerHeartbeat,
        },
        {
          provide: HandleStatusNotification,
          useValue: mockHandlerStatusNotification,
        },
        {
          provide: HandleAuthorize,
          useValue: mockHandlerAuthorize,
        },
      ],
    }).compile();

    service = module.get<ProcessOcppMessage>(ProcessOcppMessage);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should route BootNotification to handler', async () => {
    const message = [2, '123', 'BootNotification', { chargePointModel: 'Test' }];
    const context = { chargePointId: 'CP001', messageId: '123' };
    const response = [3, '123', { status: 'Accepted' }];

    const module = await Test.createTestingModule({
      providers: [
        ProcessOcppMessage,
        HandleBootNotification,
        HandleHeartbeat,
        HandleStatusNotification,
        HandleAuthorize,
        {
          provide: HandleBootNotification,
          useValue: { execute: jest.fn().mockResolvedValue(response) },
        },
        {
          provide: HandleHeartbeat,
          useValue: { execute: jest.fn() },
        },
        {
          provide: HandleStatusNotification,
          useValue: { execute: jest.fn() },
        },
        {
          provide: HandleAuthorize,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    const processService = module.get<ProcessOcppMessage>(ProcessOcppMessage);
    const result = await processService.execute(message, context as any);
    expect(result).toEqual(response);
  });

  it('should route Heartbeat to handler', async () => {
    const message = [2, '456', 'Heartbeat', {}];
    const context = { chargePointId: 'CP001', messageId: '456' };
    const response = [3, '456', { currentTime: '2025-12-07T01:00:00Z' }];

    const module = await Test.createTestingModule({
      providers: [
        ProcessOcppMessage,
        HandleBootNotification,
        HandleHeartbeat,
        HandleStatusNotification,
        HandleAuthorize,
        {
          provide: HandleBootNotification,
          useValue: { execute: jest.fn() },
        },
        {
          provide: HandleHeartbeat,
          useValue: { execute: jest.fn().mockResolvedValue(response) },
        },
        {
          provide: HandleStatusNotification,
          useValue: { execute: jest.fn() },
        },
        {
          provide: HandleAuthorize,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    const processService = module.get<ProcessOcppMessage>(ProcessOcppMessage);
    const result = await processService.execute(message, context as any);
    expect(result).toEqual(response);
  });

  it('should route StatusNotification to handler', async () => {
    const message = [2, '789', 'StatusNotification', { connectorId: 1, status: 'Available' }];
    const context = { chargePointId: 'CP001', messageId: '789' };
    const response = [3, '789', {}];

    const module = await Test.createTestingModule({
      providers: [
        ProcessOcppMessage,
        HandleBootNotification,
        HandleHeartbeat,
        HandleStatusNotification,
        HandleAuthorize,
        {
          provide: HandleBootNotification,
          useValue: { execute: jest.fn() },
        },
        {
          provide: HandleHeartbeat,
          useValue: { execute: jest.fn() },
        },
        {
          provide: HandleStatusNotification,
          useValue: { execute: jest.fn().mockResolvedValue(response) },
        },
        {
          provide: HandleAuthorize,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    const processService = module.get<ProcessOcppMessage>(ProcessOcppMessage);
    const result = await processService.execute(message, context as any);
    expect(result).toEqual(response);
  });

  it('should return NotImplemented for unknown action', async () => {
    const message = [2, 'unknown', 'UnknownAction', {}];
    const context = { chargePointId: 'CP001', messageId: 'unknown' };

    const result = await service.execute(message, context as any);
    expect(result[0]).toBe(4);
    expect(result[2]).toBe('NotImplemented');
  });

  it('should ignore non-CALL messages', async () => {
    const callResultMessage = [3, '123', {}];
    const context = { chargePointId: 'CP001', messageId: '123' };

    const result = await service.execute(callResultMessage, context as any);
    expect(result.status).toBe('ignored');
  });

  it('should handle database errors gracefully', async () => {
    const message = [2, 'error', 'Heartbeat', {}];
    const context = { chargePointId: 'CP001', messageId: 'error' };

    const module = await Test.createTestingModule({
      providers: [
        ProcessOcppMessage,
        HandleBootNotification,
        HandleHeartbeat,
        HandleStatusNotification,
        HandleAuthorize,
        {
          provide: HandleBootNotification,
          useValue: { execute: jest.fn() },
        },
        {
          provide: HandleHeartbeat,
          useValue: {
            execute: jest.fn().mockRejectedValue(new Error('Database connection failed')),
          },
        },
        {
          provide: HandleStatusNotification,
          useValue: { execute: jest.fn() },
        },
        {
          provide: HandleAuthorize,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    const processService = module.get<ProcessOcppMessage>(ProcessOcppMessage);
    const result = await processService.execute(message, context as any);
    expect(result[0]).toBe(4);
    expect(result[2]).toBe('InternalError');
  });
});
