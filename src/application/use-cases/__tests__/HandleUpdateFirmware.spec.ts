import { Test, TestingModule } from '@nestjs/testing';
import { HandleUpdateFirmware } from '../HandleUpdateFirmware';
import { OcppContext } from '../../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../../dto/OcppProtocol';

describe('HandleUpdateFirmware', () => {
  let handler: HandleUpdateFirmware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleUpdateFirmware],
    }).compile();

    handler = module.get<HandleUpdateFirmware>(HandleUpdateFirmware);
  });

  it('should accept UpdateFirmware request', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'uf-001',
      action: 'UpdateFirmware',
      payload: {
        location: 'http://example.com/firmware.bin',
        retrieveDate: new Date().toISOString(),
      },
    };

    const context = new OcppContext('CP-001', 'uf-001');
    const result = (await handler.execute(message, context)) as any;

    expect(result[0]).toBe(3);
    expect(result[1]).toBe('uf-001');
  });

  it('should handle firmware location URL', async () => {
    const locations = [
      'http://example.com/fw.bin',
      'https://cdn.example.com/firmware.zip',
      'ftp://server.example.com/update.bin',
    ];

    for (const location of locations) {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: `uf-loc-${location}`,
        action: 'UpdateFirmware',
        payload: { location },
      };

      const context = new OcppContext('CP-001', `uf-loc-${location}`);
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
    }
  });

  it('should handle retrieve date parameter', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'uf-002',
      action: 'UpdateFirmware',
      payload: {
        location: 'http://example.com/fw.bin',
        retrieveDate: futureDate.toISOString(),
      },
    };

    const context = new OcppContext('CP-001', 'uf-002');
    const result = (await handler.execute(message, context)) as any;

    expect(result[0]).toBe(3);
  });

  it('should handle install date parameter', async () => {
    const installDate = new Date();
    installDate.setDate(installDate.getDate() + 2);

    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'uf-003',
      action: 'UpdateFirmware',
      payload: {
        location: 'http://example.com/fw.bin',
        installDate: installDate.toISOString(),
      },
    };

    const context = new OcppContext('CP-001', 'uf-003');
    const result = (await handler.execute(message, context)) as any;

    expect(result[0]).toBe(3);
  });

  it('should preserve messageId', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'uf-unique-666',
      action: 'UpdateFirmware',
      payload: { location: 'http://example.com/fw.bin' },
    };

    const context = new OcppContext('CP-001', 'uf-unique-666');
    const result = (await handler.execute(message, context)) as any;

    expect(result[1]).toBe('uf-unique-666');
  });

  it('should reject invalid messageTypeId', async () => {
    const message = {
      messageTypeId: 3,
      messageId: 'uf-004',
      action: 'UpdateFirmware',
      payload: { location: 'http://example.com/fw.bin' },
    } as any as OcppCallRequest;

    const context = new OcppContext('CP-001', 'uf-004');
    const result = (await handler.execute(message, context)) as any;

    expect(result[0]).toBe(4);
  });

  it('should return array with 3 elements', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'uf-005',
      action: 'UpdateFirmware',
      payload: { location: 'http://example.com/fw.bin' },
    };

    const context = new OcppContext('CP-001', 'uf-005');
    const result = (await handler.execute(message, context)) as any;

    expect(result).toHaveLength(3);
  });

  it('should complete within 100ms', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'uf-perf',
      action: 'UpdateFirmware',
      payload: { location: 'http://example.com/fw.bin' },
    };

    const context = new OcppContext('CP-001', 'uf-perf');
    const start = performance.now();

    await handler.execute(message, context);

    expect(performance.now() - start).toBeLessThan(100);
  });

  it('should handle concurrent requests', async () => {
    const messages: OcppCallRequest[] = Array.from({ length: 5 }, (_, i) => ({
      messageTypeId: 2,
      messageId: `uf-concurrent-${i}`,
      action: 'UpdateFirmware',
      payload: { location: `http://example.com/fw-${i}.bin` },
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
      messageId: 'uf-compliance',
      action: 'UpdateFirmware',
      payload: { location: 'http://example.com/fw.bin' },
    };

    const context = new OcppContext('CP-001', 'uf-compliance');
    const result = (await handler.execute(message, context)) as any;

    expect(typeof result[0]).toBe('number');
    expect(typeof result[1]).toBe('string');
    expect(typeof result[2]).toBe('object');
  });

  it('should handle retry parameters', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'uf-retry',
      action: 'UpdateFirmware',
      payload: {
        location: 'http://example.com/fw.bin',
        retries: 3,
        retryInterval: 300,
      },
    };

    const context = new OcppContext('CP-001', 'uf-retry');
    const result = (await handler.execute(message, context)) as any;

    expect(result[0]).toBe(3);
  });
});
