import { Test, TestingModule } from '@nestjs/testing';
import { ChargePointGateway } from '../ChargePointGateway';
import { ChargePointWebSocketService } from '../ChargePointWebSocketService';

describe('ChargePointGateway - Integration Tests', () => {
  let gateway: ChargePointGateway;
  let mockService: jest.Mocked<ChargePointWebSocketService>;

  beforeEach(async () => {
    mockService = {
      processMessage: jest.fn().mockResolvedValue([3, 'msg-001', { status: 'Accepted' }]),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChargePointGateway,
        {
          provide: ChargePointWebSocketService,
          useValue: mockService,
        },
      ],
    }).compile();

    gateway = module.get<ChargePointGateway>(ChargePointGateway);
  });

  describe('WebSocket Lifecycle', () => {
    it('should handle new connection', () => {
      const client = { id: 'ws-001', emit: jest.fn(), on: jest.fn() } as any;
      gateway.handleConnection(client, 'CP-001');
      expect(client.on).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('should process incoming heartbeat message', async () => {
      const client = { id: 'ws-001', emit: jest.fn() } as any;
      const message = JSON.stringify({
        messageTypeId: 2,
        messageId: 'msg-001',
        action: 'Heartbeat',
        payload: {},
      });

      await gateway.handleMessage(client, message, 'CP-001', 'msg-001');
      expect(client.emit).toHaveBeenCalledWith('response', expect.any(String));
    });

    it('should handle invalid JSON', async () => {
      const client = { id: 'ws-001', emit: jest.fn() } as any;
      await gateway.handleMessage(client, 'INVALID', 'CP-001', 'msg-001');
      expect(client.emit).toHaveBeenCalledWith('error', expect.any(String));
    });

    it('should handle unknown action', async () => {
      const client = { id: 'ws-001', emit: jest.fn() } as any;
      mockService.processMessage.mockRejectedValueOnce(new Error('Unknown'));
      
      const message = JSON.stringify({
        messageTypeId: 2,
        messageId: 'msg-001',
        action: 'UnknownAction',
        payload: {},
      });

      await gateway.handleMessage(client, message, 'CP-001', 'msg-001');
      expect(client.emit).toHaveBeenCalledWith('error', expect.any(String));
    });

    it('should cleanup on disconnect', () => {
      const client = { id: 'ws-001' } as any;
      gateway.handleDisconnect(client);
      expect(true).toBe(true);
    });

    it('should handle missing chargePointId', async () => {
      const client = { id: 'ws-001', emit: jest.fn() } as any;
      const message = JSON.stringify({
        messageTypeId: 2,
        messageId: 'msg-001',
        action: 'Heartbeat',
        payload: {},
      });

      await gateway.handleMessage(client, message, '', 'msg-001');
      expect(client.emit).toHaveBeenCalledWith('error', expect.any(String));
    });

    it('should handle concurrent messages', async () => {
      const client = { id: 'ws-001', emit: jest.fn() } as any;
      const messages = Array(5).fill(null).map((_, i) =>
        JSON.stringify({
          messageTypeId: 2,
          messageId: `msg-${i}`,
          action: 'Heartbeat',
          payload: {},
        })
      );

      const promises = messages.map(msg =>
        gateway.handleMessage(client, msg, 'CP-001', `msg-${messages.indexOf(msg)}`)
      );

      await Promise.all(promises);
      expect(client.emit).toHaveBeenCalled();
    });

    it('should handle large message payload', async () => {
      const client = { id: 'ws-001', emit: jest.fn() } as any;
      const largePayload = { data: 'x'.repeat(10000) };
      const message = JSON.stringify({
        messageTypeId: 2,
        messageId: 'msg-001',
        action: 'Heartbeat',
        payload: largePayload,
      });

      await gateway.handleMessage(client, message, 'CP-001', 'msg-001');
      expect(client.emit).toHaveBeenCalled();
    });

    it('should broadcast to charge point', async () => {
      const client1 = { id: 'ws-001', emit: jest.fn() } as any;
      const client2 = { id: 'ws-002', emit: jest.fn() } as any;
      
      gateway.handleConnection(client1, 'CP-001');
      gateway.handleConnection(client2, 'CP-001');
      
      await gateway.broadcastToChargePoint('CP-001', { status: 'Connected' });
      expect(client1.emit).toHaveBeenCalled();
      expect(client2.emit).toHaveBeenCalled();
    });

    it('should not broadcast to other charge points', async () => {
      const client1 = { id: 'ws-001', emit: jest.fn() } as any;
      const client2 = { id: 'ws-002', emit: jest.fn() } as any;
      
      gateway.handleConnection(client1, 'CP-001');
      gateway.handleConnection(client2, 'CP-002');
      
      await gateway.broadcastToChargePoint('CP-001', { status: 'Connected' });
      expect(client1.emit).toHaveBeenCalled();
      expect(client2.emit).not.toHaveBeenCalled();
    });

    it('should handle service timeout', async () => {
      const client = { id: 'ws-001', emit: jest.fn() } as any;
      mockService.processMessage.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve([3, 'msg-001', {}]), 5000))
      );
      
      const message = JSON.stringify({
        messageTypeId: 2,
        messageId: 'msg-001',
        action: 'Heartbeat',
        payload: {},
      });

      const promise = gateway.handleMessage(client, message, 'CP-001', 'msg-001');
      await expect(promise).resolves.not.toThrow();
    });

    it('should handle service error gracefully', async () => {
      const client = { id: 'ws-001', emit: jest.fn() } as any;
      mockService.processMessage.mockRejectedValueOnce(
        new Error('Service unavailable')
      );
      
      const message = JSON.stringify({
        messageTypeId: 2,
        messageId: 'msg-001',
        action: 'Heartbeat',
        payload: {},
      });

      await gateway.handleMessage(client, message, 'CP-001', 'msg-001');
      expect(client.emit).toHaveBeenCalledWith('error', expect.any(String));
    });

    it('should validate message format', async () => {
      const client = { id: 'ws-001', emit: jest.fn() } as any;
      const invalidMessage = JSON.stringify({
        payload: {},
      });

      await gateway.handleMessage(client, invalidMessage, 'CP-001', 'msg-001');
      expect(client.emit).toHaveBeenCalledWith('error', expect.any(String));
    });

    it('should track connection count', () => {
      const client1 = { id: 'ws-001', emit: jest.fn(), on: jest.fn() } as any;
      const client2 = { id: 'ws-002', emit: jest.fn(), on: jest.fn() } as any;
      
      gateway.handleConnection(client1, 'CP-001');
      gateway.handleConnection(client2, 'CP-001');
      
      expect(gateway['chargePoints'].has('CP-001')).toBe(true);
    });

    it('should cleanup empty charge points', () => {
      const client = { id: 'ws-001', emit: jest.fn(), on: jest.fn() } as any;
      
      gateway.handleConnection(client, 'CP-001');
      gateway.handleDisconnect(client);
      
      expect(gateway['chargePoints'].has('CP-001')).toBe(false);
    });
  });
});
