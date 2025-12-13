import { Test, TestingModule } from '@nestjs/testing';
import { HandleSendLocalList } from '@/application/use-cases/HandleSendLocalList';
import { OcppContext } from '@/domain/value-objects/OcppContext';
import { OcppCallRequest } from '@/application/dto/OcppProtocol';

describe('HandleSendLocalList (OCPP 1.6 Compliant)', () => {
  let handler: HandleSendLocalList;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleSendLocalList],
    }).compile();

    handler = module.get(HandleSendLocalList);
  });

  describe('Valid Requests', () => {
    it('should accept SendLocalList with Full update type', async () => {
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

      expect(result[0]).toBe(3); // CALL_RESULT
      expect(result[2].status).toBe('Accepted');
    });

    it('should accept SendLocalList with Differential update type', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sll-002',
        action: 'SendLocalList',
        payload: {
          listVersion: 2,
          updateType: 'Differential',
        },
      };

      const context = new OcppContext('CP-001', 'sll-002');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
      expect(result[2].status).toBe('Accepted');
    });

    it('should accept authorization list entries with idTagInfo', async () => {
      const authList = [
        { idTag: 'TAG-001', idTagInfo: { status: 'Accepted' } },
        { idTag: 'TAG-002', idTagInfo: { status: 'Blocked' } },
      ];

      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sll-003',
        action: 'SendLocalList',
        payload: {
          listVersion: 3,
          localAuthorizationList: authList,
          updateType: 'Full',
        },
      };

      const context = new OcppContext('CP-001', 'sll-003');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(3);
      expect(result[2].status).toBe('Accepted');
    });
  });

  describe('OCPP 1.6 Spec Validation', () => {
    it('should reject invalid messageTypeId', async () => {
      const message = {
        messageTypeId: 3,
        messageId: 'sll-err-001',
        action: 'SendLocalList',
        payload: {},
      } as any as OcppCallRequest;

      const context = new OcppContext('CP-001', 'sll-err-001');
      const result = (await handler.execute(message, context)) as any;

      expect(result[0]).toBe(4); // CALL_ERROR
    });

    it('should reject missing listVersion', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sll-err-002',
        action: 'SendLocalList',
        payload: {
          updateType: 'Full',
        },
      };

      const context = new OcppContext('CP-001', 'sll-err-002');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].status).toBe('Failed');
    });

    it('should reject missing updateType', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sll-err-003',
        action: 'SendLocalList',
        payload: {
          listVersion: 1,
        },
      };

      const context = new OcppContext('CP-001', 'sll-err-003');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].status).toBe('Failed');
    });

    it('should reject invalid updateType value', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sll-err-004',
        action: 'SendLocalList',
        payload: {
          listVersion: 1,
          updateType: 'Invalid' as any,
        },
      };

      const context = new OcppContext('CP-001', 'sll-err-004');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].status).toBe('Failed');
    });

    it('should reject duplicate idTags (SPEC requirement)', async () => {
      const authList = [
        { idTag: 'TAG-001', idTagInfo: { status: 'Accepted' } },
        { idTag: 'TAG-001', idTagInfo: { status: 'Blocked' } }, // DUPLICATE!
      ];

      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sll-err-005',
        action: 'SendLocalList',
        payload: {
          listVersion: 1,
          localAuthorizationList: authList,
          updateType: 'Full',
        },
      };

      const context = new OcppContext('CP-001', 'sll-err-005');
      const result = (await handler.execute(message, context)) as any;

      expect(result[2].status).toBe('Failed');
    });
  });

  describe('Message Format Compliance', () => {
    it('should preserve messageId in response', async () => {
      const msgId = 'unique-msg-id-555';
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: msgId,
        action: 'SendLocalList',
        payload: { listVersion: 1, updateType: 'Full' },
      };

      const context = new OcppContext('CP-001', msgId);
      const result = (await handler.execute(message, context)) as any;

      expect(result[1]).toBe(msgId);
    });

    it('should return OCPP wire format [3, messageId, payload]', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sll-format',
        action: 'SendLocalList',
        payload: { listVersion: 1, updateType: 'Full' },
      };

      const context = new OcppContext('CP-001', 'sll-format');
      const result = (await handler.execute(message, context)) as any;

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      expect(result[0]).toBe(3); // CALL_RESULT
      expect(typeof result[1]).toBe('string');
      expect(typeof result[2]).toBe('object');
    });
  });

  describe('Performance', () => {
    it('should complete within 100ms', async () => {
      const message: OcppCallRequest = {
        messageTypeId: 2,
        messageId: 'sll-perf',
        action: 'SendLocalList',
        payload: { listVersion: 1, updateType: 'Full' },
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
        payload: { listVersion: i + 1, updateType: 'Full' as any },
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
      expect(results.every((r: any) => r[0] === 3)).toBe(true);
    });
  });
});
