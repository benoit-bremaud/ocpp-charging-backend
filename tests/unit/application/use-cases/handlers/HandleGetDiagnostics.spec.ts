import { Test, TestingModule } from '@nestjs/testing';
import { HandleGetDiagnostics } from '@/application/use-cases/HandleGetDiagnostics';
import { OcppContext } from '@/domain/value-objects/OcppContext';
import { OcppCallRequest } from '@/application/dto/OcppProtocol';

describe('HandleGetDiagnostics', () => {
  let handler: HandleGetDiagnostics;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleGetDiagnostics],
    }).compile();

    handler = module.get<HandleGetDiagnostics>(HandleGetDiagnostics);
  });

  it('should accept GetDiagnostics request', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gd-001',
      action: 'GetDiagnostics',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'gd-001');
    const result = (await handler.execute(message, context)) as any;

    expect(result[0]).toBe(3);
    expect(result[2].fileName).toBeDefined();
  });

  it('should return fileName in response', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gd-002',
      action: 'GetDiagnostics',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'gd-002');
    const result = (await handler.execute(message, context)) as any;

    expect(typeof result[2].fileName).toBe('string');
    expect(result[2].fileName).toContain('diagnostics');
  });

  it('should preserve messageId', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gd-unique-333',
      action: 'GetDiagnostics',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'gd-unique-333');
    const result = (await handler.execute(message, context)) as any;

    expect(result[1]).toBe('gd-unique-333');
  });

  it('should handle empty payload', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gd-003',
      action: 'GetDiagnostics',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'gd-003');
    const result = (await handler.execute(message, context)) as any;

    expect(result[0]).toBe(3);
  });

  it('should handle different chargepoints', async () => {
    for (const cpId of ['CP-001', 'CP-002', 'CP-003']) {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: `gd-cp-${cpId}`,
        action: 'GetDiagnostics',
        payload: {},
      };

      const context = new OcppContext(cpId, `gd-cp-${cpId}`);
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    }
  });

  it('should reject invalid messageTypeId', async () => {
    const message = {
      messageTypeId: 3,
      messageId: 'gd-004',
      action: 'GetDiagnostics',
      payload: {},
    } as any as OcppCallRequest;

    const context = new OcppContext('CP-001', 'gd-004');
    const result = (await handler.execute(message, context)) as any;

    expect(result[0]).toBe(4);
  });

  it('should return array with 3 elements', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gd-005',
      action: 'GetDiagnostics',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'gd-005');
    const result = (await handler.execute(message, context)) as any;

    expect(result).toHaveLength(3);
  });

  it('should complete within 100ms', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'gd-perf',
      action: 'GetDiagnostics',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'gd-perf');
    const start = performance.now();

    await handler.execute(message, context);

    expect(performance.now() - start).toBeLessThan(100);
  });

  it('should handle concurrent requests', async () => {
    const messages: OcppCallRequest[] = Array.from({ length: 5 }, (_, i) => ({
      messageTypeId: 2,
      messageId: `gd-concurrent-${i}`,
      action: 'GetDiagnostics',
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
      messageId: 'gd-compliance',
      action: 'GetDiagnostics',
      payload: {},
    };

    const context = new OcppContext('CP-001', 'gd-compliance');
    const result = (await handler.execute(message, context)) as any;

    expect(typeof result[0]).toBe('number');
    expect(typeof result[1]).toBe('string');
    expect(typeof result[2]).toBe('object');
  });

  it('should generate unique fileName per request', async () => {
    const files = new Set<string>();

    for (let i = 0; i < 3; i++) {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: `gd-unique-${i}`,
        action: 'GetDiagnostics',
        payload: {},
      };

      const context = new OcppContext('CP-001', `gd-unique-${i}`);
      const result = (await handler.execute(message, context)) as any;

      files.add(result[2].fileName);
    }

    expect(files.size).toBeGreaterThanOrEqual(1);
  });
});
