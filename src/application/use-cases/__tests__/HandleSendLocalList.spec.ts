import { Test, TestingModule } from '@nestjs/testing';
import { HandleSendLocalList } from '../HandleSendLocalList';
import { OcppContext } from '../../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../../dto/OcppProtocol';

describe('HandleSendLocalList', () => {
  let handler: HandleSendLocalList;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleSendLocalList],
    }).compile();

    handler = module.get<HandleSendLocalList>(HandleSendLocalList);
  });

  it('should accept SendLocalList request', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'sll-001',
      action: 'SendLocalList',
      payload: {
        listVersion: 1,
        localAuthorizationList: [],
        updateType: 'Full',
      },
    };

    const context = new OcppContext('CP-001', 'sll-001');
    const result = (await handler.execute(message, context)) as any;

    expect(result[0]).toBe(3);
    expect(result[2].status).toBe('Accepted');
  });

  it('should handle Full update type', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'sll-002',
      action: 'SendLocalList',
      payload: { listVersion: 1, updateType: 'Full' },
    };

    const context = new OcppContext('CP-001', 'sll-002');
    const result = (await handler.execute(message, context)) as any;

    expect(result[0]).toBe(3);
  });

  it('should handle Differential update type', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'sll-003',
      action: 'SendLocalList',
      payload: { listVersion: 2, updateType: 'Differential' },
    };

    const context = new OcppContext('CP-001', 'sll-003');
    const result = (await handler.execute(message, context)) as any;

    expect(result[0]).toBe(3);
  });

  it('should preserve messageId', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'sll-unique-555',
      action: 'SendLocalList',
      payload: { listVersion: 1 },
    };

    const context = new OcppContext('CP-001', 'sll-unique-555');
    const result = (await handler.execute(message, context)) as any;

    expect(result[1]).toBe('sll-unique-555');
  });

  it('should handle authorization list entries', async () => {
    const authList = [
      { idTag: 'TAG-001', idTokenInfo: { status: 'Accepted' } },
      { idTag: 'TAG-002', idTokenInfo: { status: 'Blocked' } },
    ];

    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'sll-004',
      action: 'SendLocalList',
      payload: {
        listVersion: 3,
        localAuthorizationList: authList,
        updateType: 'Full',
      },
    };

    const context = new OcppContext('CP-001', 'sll-004');
    const result = (await handler.execute(message, context)) as any;

    expect(result[0]).toBe(3);
  });

  it('should reject invalid messageTypeId', async () => {
    const message = {
      messageTypeId: 3,
      messageId: 'sll-005',
      action: 'SendLocalList',
      payload: {},
    } as any as OcppCallRequest;

    const context = new OcppContext('CP-001', 'sll-005');
    const result = (await handler.execute(message, context)) as any;

    expect(result[0]).toBe(4);
  });

  it('should return array with 3 elements', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'sll-006',
      action: 'SendLocalList',
      payload: { listVersion: 1 },
    };

    const context = new OcppContext('CP-001', 'sll-006');
    const result = (await handler.execute(message, context)) as any;

    expect(result).toHaveLength(3);
  });

  it('should complete within 100ms', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'sll-perf',
      action: 'SendLocalList',
      payload: { listVersion: 1 },
    };

    const context = new OcppContext('CP-001', 'sll-perf');
    const start = performance.now();

    await handler.execute(message, context);

    expect(performance.now() - start).toBeLessThan(100);
  });

  it('should handle concurrent requests', async () => {
    const messages: OcppCallRequest[] = Array.from({ length: 5 }, (_, i) => ({
      messageTypeId: 2,
      messageId: `sll-concurrent-${i}`,
      action: 'SendLocalList',
      payload: { listVersion: i + 1 },
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
      messageId: 'sll-compliance',
      action: 'SendLocalList',
      payload: { listVersion: 1 },
    };

    const context = new OcppContext('CP-001', 'sll-compliance');
    const result = (await handler.execute(message, context)) as any;

    expect(typeof result[0]).toBe('number');
    expect(typeof result[1]).toBe('string');
    expect(typeof result[2]).toBe('object');
  });

  it('should return Accepted status', async () => {
    const message: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'sll-status',
      action: 'SendLocalList',
      payload: { listVersion: 1 },
    };

    const context = new OcppContext('CP-001', 'sll-status');
    const result = (await handler.execute(message, context)) as any;

    expect(result[2].status).toBe('Accepted');
  });
});
