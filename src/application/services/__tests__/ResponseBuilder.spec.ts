import { ResponseBuilder } from '../ResponseBuilder';

describe('ResponseBuilder', () => {
  let builder: ResponseBuilder;

  beforeEach(() => {
    builder = new ResponseBuilder();
  });

  describe('buildCallResult', () => {
    it('should build valid CallResult [3, messageId, payload]', () => {
      const result = builder.buildCallResult('msg-1', { status: 'Accepted' });

      expect(result).toEqual([3, 'msg-1', { status: 'Accepted' }]);
      expect(result[0]).toBe(3);
      expect(result[1]).toBe('msg-1');
      expect(result[2]).toEqual({ status: 'Accepted' });
    });

    it('should handle empty payload', () => {
      const result = builder.buildCallResult('msg-2', {});

      expect(result).toEqual([3, 'msg-2', {}]);
    });

    it('should handle complex payload', () => {
      const payload = {
        status: 'Accepted',
        transactionId: 123,
        details: { nested: true },
      };

      const result = builder.buildCallResult('msg-3', payload);

      expect(result[2]).toEqual(payload);
    });
  });

  describe('buildCallError', () => {
    it('should build valid CallError [4, messageId, errorCode, errorMsg]', () => {
      const result = builder.buildCallError('msg-1', 'NotImplemented', 'Handler not found');

      expect(result).toEqual([4, 'msg-1', 'NotImplemented', 'Handler not found']);
      expect(result[0]).toBe(4);
      expect(result[1]).toBe('msg-1');
      expect(result[2]).toBe('NotImplemented');
      expect(result[3]).toBe('Handler not found');
    });

    it('should handle all error codes', () => {
      const codes = [
        'NotImplemented',
        'NotSupported',
        'InternalError',
        'ProtocolError',
        'SecurityError',
      ] as const;

      codes.forEach((code) => {
        const result = builder.buildCallError('msg-' + code, code, 'Error message');
        expect(result[2]).toBe(code);
      });
    });
  });

  describe('buildEmptyResponse', () => {
    it('should build empty response', () => {
      const result = builder.buildEmptyResponse('msg-1');

      expect(result).toEqual([3, 'msg-1', {}]);
    });
  });

  describe('buildStatusResponse', () => {
    it('should build response with status field', () => {
      const result = builder.buildStatusResponse('msg-1', 'Accepted');

      expect(result).toEqual([3, 'msg-1', { status: 'Accepted' }]);
    });

    it('should handle various status values', () => {
      const statuses = ['Accepted', 'Rejected', 'Pending', 'InProgress'];

      statuses.forEach((status) => {
        const result = builder.buildStatusResponse('msg-' + status, status);
        expect(result[2].status).toBe(status);
      });
    });
  });
});
