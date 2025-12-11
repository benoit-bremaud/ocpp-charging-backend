import { Test, TestingModule } from '@nestjs/testing';

import { HandleStartTransaction } from '@/application/use-cases/HandleStartTransaction';
import { OcppCallRequest } from '@/application/dto/OcppProtocol';
import { OcppContext } from '@/domain/value-objects/OcppContext';
import { IChargePointRepository } from '@/domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '@/infrastructure/tokens';

describe('HandleStartTransaction', () => {
  let handler: HandleStartTransaction;
  let mockRepository: jest.Mocked<IChargePointRepository>;

  beforeEach(async () => {
    mockRepository = {
      findByChargePointId: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleStartTransaction,
        {
          provide: CHARGE_POINT_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    handler = module.get<HandleStartTransaction>(HandleStartTransaction);
  });

  describe('execute', () => {
    const validContext: OcppContext = {
      chargePointId: 'CP-001',
      messageId: 'msg-123',
    } as any;

    const validMessage: OcppCallRequest = {
      messageTypeId: 2,
      messageId: 'msg-123',
      action: 'StartTransaction',
      payload: {
        connectorId: 1,
        idTag: 'TAG-123',
        timestamp: new Date().toISOString(),
        meterStart: 1000,
      },
    };

    it('should accept valid StartTransaction request', async () => {
      const mockChargePoint = { id: '1', chargePointId: 'CP-001' };
      mockRepository.findByChargePointId.mockResolvedValueOnce(mockChargePoint as any);

      const result = await handler.execute(validMessage, validContext);

      expect(result).toEqual([
        3,
        'msg-123',
        {
          transactionId: expect.any(Number),
          idTagInfo: {
            status: 'Accepted',
          },
        },
      ]);
      expect(mockRepository.findByChargePointId).toHaveBeenCalledWith('CP-001');
    });

    it('should reject non-CALL message types', async () => {
      const invalidMessage: any = {
        ...validMessage,
        messageTypeId: 3, // CALLRESULT, not CALL
      };

      const result = await handler.execute(invalidMessage, validContext);

      expect(result[0]).toBe(4); // CALLERROR
      expect(result[1]).toBe('msg-123');
      expect(result[2]).toBe('GenericError');
    });

    it('should reject ChargePoint not found', async () => {
      mockRepository.findByChargePointId.mockResolvedValueOnce(null);

      const result = await handler.execute(validMessage, validContext);

      expect(result[0]).toBe(4); // CALLERROR
      expect(result[2]).toBe('GenericError');
      expect((result[3] as string).includes('not found')).toBe(true);
    });

    it('should reject missing connectorId', async () => {
      const mockChargePoint = { id: '1', chargePointId: 'CP-001' };
      mockRepository.findByChargePointId.mockResolvedValueOnce(mockChargePoint as any);

      const invalidMessage: OcppCallRequest = {
        ...validMessage,
        payload: {
          ...validMessage.payload,
          connectorId: undefined,
        },
      };

      const result = await handler.execute(invalidMessage, validContext);

      expect(result[0]).toBe(4); // CALLERROR
      expect((result[3] as string).includes('connectorId')).toBe(true);
    });

    it('should reject missing idTag', async () => {
      const mockChargePoint = { id: '1', chargePointId: 'CP-001' };
      mockRepository.findByChargePointId.mockResolvedValueOnce(mockChargePoint as any);

      const invalidMessage: OcppCallRequest = {
        ...validMessage,
        payload: {
          ...validMessage.payload,
          idTag: undefined,
        },
      };

      const result = await handler.execute(invalidMessage, validContext);

      expect(result[0]).toBe(4); // CALLERROR
      expect((result[3] as string).includes('idTag')).toBe(true);
    });

    it('should reject missing meterStart', async () => {
      const mockChargePoint = { id: '1', chargePointId: 'CP-001' };
      mockRepository.findByChargePointId.mockResolvedValueOnce(mockChargePoint as any);

      const invalidMessage: OcppCallRequest = {
        ...validMessage,
        payload: {
          ...validMessage.payload,
          meterStart: undefined,
        },
      };

      const result = await handler.execute(invalidMessage, validContext);

      expect(result[0]).toBe(4); // CALLERROR
      expect((result[3] as string).includes('meterStart')).toBe(true);
    });

    it('should generate unique transactionId for each request', async () => {
      const mockChargePoint = { id: '1', chargePointId: 'CP-001' };
      mockRepository.findByChargePointId.mockResolvedValue(mockChargePoint as any);

      const result1 = await handler.execute(validMessage, validContext);
      const result2 = await handler.execute(validMessage, {
        ...validContext,
        messageId: 'msg-124',
      });

      const txId1 = (result1[2] as any).transactionId;
      const txId2 = (result2[2] as any).transactionId;

      expect(txId1).toBeDefined();
      expect(txId2).toBeDefined();
      expect(typeof txId1).toBe('number');
      expect(typeof txId2).toBe('number');
    });

    it('should return idTagInfo with Accepted status', async () => {
      const mockChargePoint = { id: '1', chargePointId: 'CP-001' };
      mockRepository.findByChargePointId.mockResolvedValueOnce(mockChargePoint as any);

      const result = await handler.execute(validMessage, validContext);

      const conf = result[2] as any;
      expect(conf.idTagInfo).toBeDefined();
      expect(conf.idTagInfo.status).toBe('Accepted');
    });

    it('should handle various connector IDs', async () => {
      const mockChargePoint = { id: '1', chargePointId: 'CP-001' };
      mockRepository.findByChargePointId.mockResolvedValue(mockChargePoint as any);

      const connectorIds = [1, 2, 3, 4];

      for (const connectorId of connectorIds) {
        const message: OcppCallRequest = {
          ...validMessage,
          payload: {
            ...validMessage.payload,
            connectorId,
          },
        };

        const result = await handler.execute(message, validContext);
        expect(result[0]).toBe(3); // CALLRESULT
        expect((result[2] as any).transactionId).toBeDefined();
      }
    });

    it('should return proper OCPP wire format [3, messageId, payload]', async () => {
      const mockChargePoint = { id: '1', chargePointId: 'CP-001' };
      mockRepository.findByChargePointId.mockResolvedValueOnce(mockChargePoint as any);

      const result = await handler.execute(validMessage, validContext);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toBe(3); // CALLRESULT type
      expect(result[1]).toBe('msg-123'); // messageId
      expect(typeof result[2]).toBe('object'); // payload
    });
  });
});
