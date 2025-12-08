import { Test, TestingModule } from '@nestjs/testing';
const CHARGE_POINT_REPOSITORY_TOKEN = 'IChargePointRepository';

import { HandleHeartbeat } from '../HandleHeartbeat';
import { OcppCallRequest } from '../../dto/OcppProtocol';
import { OcppContext } from '../../../domain/value-objects/OcppContext';

describe('HandleHeartbeat', () => {
  let useCase: HandleHeartbeat;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleHeartbeat],
    }).compile();

    useCase = module.get<HandleHeartbeat>(HandleHeartbeat);
  });

  it('should respond to Heartbeat with current time', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'hb-001',
      action: 'Heartbeat',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'hb-001');
    const result = await useCase.execute(message, context);

    expect(result[0]).toBe(3); // CALLRESULT
    expect(result[1]).toBe('hb-001');
    expect(result[2]).toHaveProperty('currentTime');
  });

  it('should validate message is CALL type', async () => {
    const invalidMessage = {
      messageTypeId: 99,
      messageId: 'hb-002',
      action: 'Heartbeat',
      payload: {},
    } as unknown as OcppCallRequest;

    const context = new OcppContext('CP-001', 'hb-002');
    const result = await useCase.execute(invalidMessage, context);

    expect(result[0]).toBe(4); // CALLERROR
  });

  it('should return heartbeat response', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'hb-003',
      action: 'Heartbeat',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'hb-003');
    const result = await useCase.execute(message, context);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle heartbeat error response', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'hb-004',
      action: 'Heartbeat',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'hb-004');
    const result = await useCase.execute(message, context);

    expect(result[0]).toBe(3); // CALLRESULT
  });

  it('should preserve messageId in response', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'hb-preserve-id',
      action: 'Heartbeat',
      payload: {},
    };
    const context = new OcppContext('CP-001', 'hb-preserve-id');
    
    const result = await useCase.execute(message, context);
    
    expect(result[1]).toBe('hb-preserve-id');
  });

  it('should reject payload with extra properties', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'hb-extra-props',
      action: 'Heartbeat',
      payload: { extraField: 'invalid' }, // ❌ Extra property
    };
    const context = new OcppContext('CP-001', 'hb-extra-props');

    const result = await useCase.execute(message, context);

    expect(result[0]).toBe(4); // CALLERROR
    expect(result[2]).toBe('FormationViolation');
  });

  it('should log successful heartbeat processing', async () => {
    const logSpy = jest.spyOn(useCase['logger'], 'log').mockImplementation();
    
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'hb-logging',
      action: 'Heartbeat',
      payload: {},
    };
    const context = new OcppContext('CP-001', 'hb-logging');
    
    await useCase.execute(message, context);
    
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it('should complete within 50ms', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'hb-perf',
      action: 'Heartbeat',
      payload: {},
    };
    const context = new OcppContext('CP-001', 'hb-perf');
    
    const start = performance.now();
    await useCase.execute(message, context);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(50);
  });

});
