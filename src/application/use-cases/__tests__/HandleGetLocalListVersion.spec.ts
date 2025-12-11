import { Test, TestingModule } from '@nestjs/testing';
import { HandleGetLocalListVersion } from '../HandleGetLocalListVersion';
import { OcppContext } from '../../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../../dto/OcppProtocol';

describe('HandleGetLocalListVersion', () => {
  let handler: HandleGetLocalListVersion;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleGetLocalListVersion],
    }).compile();

    handler = module.get<HandleGetLocalListVersion>(HandleGetLocalListVersion);
  });

  it('should accept GetLocalListVersion request', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gllv-001',
      action: 'GetLocalListVersion',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'gllv-001');
    const result = (await handler.execute(message, context)) as any;

    expect(result[0]).toBe(3);
    expect(result[2].listVersion).toBeDefined();
  });

  it('should return listVersion as number', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gllv-002',
      action: 'GetLocalListVersion',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'gllv-002');
    const result = (await handler.execute(message, context)) as any;

    expect(typeof result[2].listVersion).toBe('number');
    expect(result[2].listVersion).toBeGreaterThanOrEqual(0);
  });

  it('should preserve messageId', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gllv-unique-444',
      action: 'GetLocalListVersion',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'gllv-unique-444');
    const result = (await handler.execute(message, context)) as any;

    expect(result[1]).toBe('gllv-unique-444');
  });

  it('should handle empty payload', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gllv-003',
      action: 'GetLocalListVersion',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'gllv-003');
    const result = (await handler.execute(message, context)) as any;

    expect(result[0]).toBe(3);
  });

  it('should handle different chargepoints', async () => {
    for (const cpId of ['CP-001', 'CP-002', 'CP-003']) {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: `gllv-cp-${cpId}`,
        action: 'GetLocalListVersion',
        payload: {},
      };

      const context = new OcppContext(cpId, `gllv-cp-${cpId}`);
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    }
  });

  it('should reject invalid messageTypeId', async () => {
    const message = {
      messageTypeId: 3,
      messageId: 'gllv-004',
      action: 'GetLocalListVersion',
      payload: {},
    } as any as OcppCallRequest;

    const context = new OcppContext('CP-001', 'gllv-004');
    const result = (await handler.execute(message, context)) as any;

    expect(result[0]).toBe(4);
  });

  it('should return array with 3 elements', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gllv-005',
      action: 'GetLocalListVersion',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'gllv-005');
    const result = (await handler.execute(message, context)) as any;

    expect(result).toHaveLength(3);
  });

  it('should complete within 100ms', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gllv-perf',
      action: 'GetLocalListVersion',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'gllv-perf');
    const start = performance.now();

    await handler.execute(message, context);

    expect(performance.now() - start).toBeLessThan(100);
  });

  it('should handle concurrent requests', async () => {
    const messages: OcppCallRequest[] = Array.from({ length: 5 }, (_, i) => ({
      messageTypeId: 2,
      messageId: `gllv-concurrent-${i}`,
      action: 'GetLocalListVersion',
      payload: {},
    })) as any;

    const contexts = messages.map(
      (msg: OcppCallRequest) => new OcppContext('CP-001', msg.messageId),
    );

    const results = await Promise.all(
      messages.map((msg: OcppCallRequest, idx: number) =>
        handler.execute(msg, contexts[idx]),
      ),
    );

    expect(results).toHaveLength(5);
  });

  it('should return OCPP wire format', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gllv-compliance',
      action: 'GetLocalListVersion',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'gllv-compliance');
    const result = (await handler.execute(message, context)) as any;

    expect(typeof result[0]).toBe('number');
    expect(typeof result[1]).toBe('string');
    expect(typeof result[2]).toBe('object');
  });

  it('should have valid listVersion value', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gllv-version',
      action: 'GetLocalListVersion',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'gllv-version');
    const result = (await handler.execute(message, context)) as any;

    expect(Number.isInteger(result[2].listVersion)).toBe(true);
  });
});
