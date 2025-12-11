import { Test, TestingModule } from '@nestjs/testing';
import { Socket, Server } from 'socket.io';
import { ChargePointGateway } from '../ChargePointGateway';
import { ProcessOcppMessage } from '../../../application/use-cases/ProcessOcppMessage';
import { OcppContext } from '../../../domain/value-objects/OcppContext';

describe('ChargePointGateway - Integration Tests', () => {
  let gateway: ChargePointGateway;
  let mockProcessOcppMessage: jest.Mocked<ProcessOcppMessage>;
  let mockServer: jest.Mocked<Server>;
  let mockClient: jest.Mocked<Socket>;

  beforeEach(async () => {
    mockProcessOcppMessage = {
      execute: jest.fn().mockResolvedValue([3, 'msg-001', { status: 'Accepted' }]),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChargePointGateway,
        {
          provide: ProcessOcppMessage,
          useValue: mockProcessOcppMessage,
        },
      ],
    }).compile();

    gateway = module.get<ChargePointGateway>(ChargePointGateway);

    // Mock server
    mockServer = {
      emit: jest.fn(),
    } as any;
    (gateway as any).server = mockServer;

    // Mock client with handshake query
    mockClient = {
      disconnect: jest.fn(),
      emit: jest.fn(),
      handshake: {
        query: { chargePointId: 'CP-001' },
        address: '192.168.1.100',
      },
    } as any;
  });

  describe('WebSocket Lifecycle', () => {
    it('should handle new connection with valid chargePointId', () => {
      gateway.handleConnection(mockClient);

      expect(mockServer.emit).toHaveBeenCalledWith('chargepoint:connected', {
        chargePointId: 'CP-001',
      });
      expect(gateway.isConnected('CP-001')).toBe(true);
    });

    it('should process incoming OCPP heartbeat message', async () => {
      gateway.handleConnection(mockClient);

      const message = [2, 'msg-001', 'Heartbeat', {}];
      await gateway.handleOcppMessage(mockClient, message);

      expect(mockProcessOcppMessage.execute).toHaveBeenCalled();
      expect(mockClient.emit).toHaveBeenCalledWith('ocpp:response', expect.any(Array));
    });

    it('should handle connection without chargePointId', () => {
      const clientNoId = {
        disconnect: jest.fn(),
        emit: jest.fn(),
        handshake: {
          query: {},
          address: '192.168.1.100',
        },
      } as any;

      gateway.handleConnection(clientNoId);

      expect(clientNoId.disconnect).toHaveBeenCalled();
      expect(gateway.isConnected('undefined')).toBe(false);
    });

    it('should handle OCPP message processing errors gracefully', async () => {
      gateway.handleConnection(mockClient);
      mockProcessOcppMessage.execute.mockRejectedValueOnce(
        new Error('Processing failed'),
      );

      const message = [2, 'msg-001', 'UnknownAction', {}];
      await gateway.handleOcppMessage(mockClient, message);

      expect(mockClient.emit).toHaveBeenCalledWith('ocpp:error', {
        message: 'Internal server error',
      });
    });

    it('should cleanup on disconnect', () => {
      gateway.handleConnection(mockClient);
      expect(gateway.isConnected('CP-001')).toBe(true);

      gateway.handleDisconnect(mockClient);

      expect(gateway.isConnected('CP-001')).toBe(false);
      expect(mockServer.emit).toHaveBeenCalledWith('chargepoint:disconnected', {
        chargePointId: 'CP-001',
      });
    });

    it('should send command to connected charge point', () => {
      gateway.handleConnection(mockClient);

      const result = gateway.sendCommandToChargePoint(
        'CP-001',
        'cmd-001',
        'Reset',
        { type: 'Hard' },
      );

      expect(result).toBe(true);
      expect(mockClient.emit).toHaveBeenCalledWith('ocpp:command', [
        2,
        'cmd-001',
        'Reset',
        { type: 'Hard' },
      ]);
    });

    it('should not send command to disconnected charge point', () => {
      const result = gateway.sendCommandToChargePoint(
        'CP-002',
        'cmd-001',
        'Reset',
        { type: 'Hard' },
      );

      expect(result).toBe(false);
    });

    it('should handle multiple concurrent OCPP messages', async () => {
      gateway.handleConnection(mockClient);

      const messages = [
        [2, 'msg-001', 'Heartbeat', {}],
        [2, 'msg-002', 'Heartbeat', {}],
        [2, 'msg-003', 'Heartbeat', {}],
        [2, 'msg-004', 'Heartbeat', {}],
        [2, 'msg-005', 'Heartbeat', {}],
      ];

      const promises = messages.map((msg) =>
        gateway.handleOcppMessage(mockClient, msg),
      );

      await Promise.all(promises);
      expect(mockProcessOcppMessage.execute).toHaveBeenCalledTimes(5);
    });

    it('should handle large OCPP payload', async () => {
      gateway.handleConnection(mockClient);

      const largePayload = {
        data: 'x'.repeat(10000),
      };
      const message = [2, 'msg-001', 'SendLocalList', largePayload];

      await gateway.handleOcppMessage(mockClient, message);

      expect(mockProcessOcppMessage.execute).toHaveBeenCalled();
      expect(mockClient.emit).toHaveBeenCalledWith('ocpp:response', expect.any(Array));
    });

    it('should track multiple connected charge points', () => {
      const client1 = {
        disconnect: jest.fn(),
        emit: jest.fn(),
        handshake: {
          query: { chargePointId: 'CP-001' },
          address: '192.168.1.100',
        },
      } as any;

      const client2 = {
        disconnect: jest.fn(),
        emit: jest.fn(),
        handshake:{
          query: { chargePointId: 'CP-002' },
          address: '192.168.1.101',
        },
      } as any;

      gateway.handleConnection(client1);
      gateway.handleConnection(client2);

      const connectedCPs = gateway.getConnectedChargePoints();
      expect(connectedCPs).toContain('CP-001');
      expect(connectedCPs).toContain('CP-002');
      expect(connectedCPs).toHaveLength(2);
    });

    it('should not send commands to other charge points', () => {
      const client1 = {
        disconnect: jest.fn(),
        emit: jest.fn(),
        handshake: {
          query: { chargePointId: 'CP-001' },
          address: '192.168.1.100',
        },
      } as any;

      const client2 = {
        disconnect: jest.fn(),
        emit: jest.fn(),
        handshake: {
          query: { chargePointId: 'CP-002' },
          address: '192.168.1.101',
        },
      } as any;

      gateway.handleConnection(client1);
      gateway.handleConnection(client2);

      gateway.sendCommandToChargePoint('CP-001', 'cmd-001', 'Reset', {});

      expect(client1.emit).toHaveBeenCalledWith('ocpp:command', expect.any(Array));
      expect(client2.emit).not.toHaveBeenCalledWith('ocpp:command', expect.any(Array));
    });

    it('should emit broadcast events on message received', async () => {
      gateway.handleConnection(mockClient);

      const message = [2, 'msg-001', 'Heartbeat', {}];
      await gateway.handleOcppMessage(mockClient, message);

      expect(mockServer.emit).toHaveBeenCalledWith('ocpp:message:received', {
        chargePointId: 'CP-001',
        messageId: 'msg-001',
        timestamp: expect.any(Date),
      });
    });

    it('should handle BootNotification with large optional fields', async () => {
      gateway.handleConnection(mockClient);

      const bootMessage = [
        2,
        'msg-001',
        'BootNotification',
        {
          chargePointVendor: 'VendorName',
          chargePointModel: 'ModelX',
          chargePointSerialNumber: 'SN-12345',
          chargeBoxSerialNumber: 'CBS-12345',
          firmwareVersion: '1.0.0',
          iccid: 'ICCID-12345',
          imsi: 'IMSI-12345',
          meterSerialNumber: 'MSN-12345',
          meterType: 'MeterType',
        },
      ];

      await gateway.handleOcppMessage(mockClient, bootMessage);

      expect(mockProcessOcppMessage.execute).toHaveBeenCalled();
    });

    it('should verify OCPP message wire format compliance', async () => {
      gateway.handleConnection(mockClient);

      // Standard OCPP 1.6 format: [2, messageId, action, payload]
      const message = [2, 'msg-001', 'Heartbeat', {}];
      await gateway.handleOcppMessage(mockClient, message);

      expect(mockProcessOcppMessage.execute).toHaveBeenCalledWith(
        message,
        expect.any(OcppContext),
      );
    });

    it('should cleanup all client connections on disconnect', () => {
      const client1 = {
        disconnect: jest.fn(),
        emit: jest.fn(),
        handshake: {
          query: { chargePointId: 'CP-001' },
          address: '192.168.1.100',
        },
      } as any;

      const client2 = {
        disconnect: jest.fn(),
        emit: jest.fn(),
        handshake: {
          query: { chargePointId: 'CP-002' },
          address: '192.168.1.101',
        },
      } as any;

      gateway.handleConnection(client1);
      gateway.handleConnection(client2);

      expect(gateway.getConnectedChargePoints()).toHaveLength(2);

      gateway.handleDisconnect(client1);
      expect(gateway.getConnectedChargePoints()).toHaveLength(1);
      expect(gateway.isConnected('CP-001')).toBe(false);

      gateway.handleDisconnect(client2);
      expect(gateway.getConnectedChargePoints()).toHaveLength(0);
    });
  });
});
