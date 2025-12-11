import { Test, TestingModule } from '@nestjs/testing';
import { HandleGetConfiguration } from '@/application/use-cases/HandleGetConfiguration';
import { OcppContext } from '@/domain/value-objects/OcppContext';
import { OcppCallRequest } from '@/application/dto/OcppProtocol';

describe('HandleGetConfiguration', () => {
  let handler: HandleGetConfiguration;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleGetConfiguration],
    }).compile();

    handler = module.get<HandleGetConfiguration>(HandleGetConfiguration);
  });

  it('should accept GetConfiguration request', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gc-001',
      action: 'GetConfiguration',
      payload: { key: ['HeartbeatInterval', 'MeterValueSampleInterval'] },
    };

    const context = new OcppContext('CP-001', 'gc-001');
    const result = (await handler.execute(message, context)) as any;

    expect(result[0]).toBe(3);
    expect(result[2].configurationKey).toBeDefined();
  });

  it('should handle empty key list', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gc-002',
      action: 'GetConfiguration',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'gc-002');
    const result = (await handler.execute(message, context)) as any;

    expect(result[0]).toBe(3);
    expect(Array.isArray(result[2].configurationKey)).toBe(true);
  });

  it('should return unknownKey array', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gc-003',
      action: 'GetConfiguration',
      payload: { key: ['UnknownKey'] },
    };

    const context = new OcppContext('CP-001', 'gc-003');
    const result = (await handler.execute(message, context)) as any;

    expect(Array.isArray(result[2].unknownKey)).toBe(true);
  });

  it('should preserve messageId', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gc-unique-222',
      action: 'GetConfiguration',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'gc-unique-222');
    const result = (await handler.execute(message, context)) as any;

    expect(result[1]).toBe('gc-unique-222');
  });

  it('should handle multiple keys', async () => {
    const keys = ['Key1', 'Key2', 'Key3', 'Key4'];
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gc-004',
      action: 'GetConfiguration',
      payload: { key: keys },
    };

    const context = new OcppContext('CP-001', 'gc-004');
    const result = (await handler.execute(message, context)) as any;

    expect(result[0]).toBe(3);
  });

  it('should reject invalid messageTypeId', async () => {
    const message = {
      messageTypeId: 3,
      messageId: 'gc-005',
      action: 'GetConfiguration',
      payload: {},
    } as any as OcppCallRequest;

    const context = new OcppContext('CP-001', 'gc-005');
    const result = (await handler.execute(message, context)) as any;

    expect(result[0]).toBe(4);
  });

  it('should return array with 3 elements', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gc-006',
      action: 'GetConfiguration',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'gc-006');
    const result = (await handler.execute(message, context)) as any;

    expect(result).toHaveLength(3);
  });

  it('should complete within 100ms', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gc-perf',
      action: 'GetConfiguration',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'gc-perf');
    const start = performance.now();

    await handler.execute(message, context);

    expect(performance.now() - start).toBeLessThan(100);
  });

  it('should handle concurrent requests', async () => {
    const messages: OcppCallRequest[] = Array.from({ length: 5 }, (_, i) => ({
      messageTypeId: 2,
      messageId: `gc-concurrent-${i}`,
      action: 'GetConfiguration',
      payload: { key: [`Key${i}`] },
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
      messageId: 'gc-compliance',
      action: 'GetConfiguration',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'gc-compliance');
    const result = (await handler.execute(message, context)) as any;

    expect(typeof result[0]).toBe('number');
    expect(typeof result[1]).toBe('string');
    expect(typeof result[2]).toBe('object');
  });

  it('should have configurationKey and unknownKey', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gc-keys',
      action: 'GetConfiguration',
      payload: { key: ['TestKey'] },
    };

    const context = new OcppContext('CP-001', 'gc-keys');
    const result = (await handler.execute(message, context)) as any;

    expect(result[2].configurationKey).toBeDefined();
    expect(result[2].unknownKey).toBeDefined();
  });
});
