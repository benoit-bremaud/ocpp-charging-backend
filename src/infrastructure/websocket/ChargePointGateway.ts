import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Infrastructure Layer: WebSocket adapter for real-time ChargePoint communication.
 *
 * CLEAN: Gateway = transport adapter (WebSocket), no business logic.
 * SOLID: SRP - only handles WebSocket events, delegates to service.
 *
 * STEP 10: NestJS 11 WebSocket Gateway - ACTIVE
 */
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: 'charge-points',
  transports: ['websocket'],
})
@Injectable()
export class ChargePointGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger('ChargePointGateway');

  @WebSocketServer()
  server!: Server;

  private connectedClients: Map<string, Socket> = new Map();

  /**
   * Handle client connection.
   */
  handleConnection(client: Socket): void {
    const chargePointId = client.handshake.query.chargePointId as string;

    if (chargePointId) {
      this.connectedClients.set(chargePointId, client);
      this.logger.log(`✅ ChargePoint connected: ${chargePointId}`);
      this.server.emit('charge-point:connected', { chargePointId });
    } else {
      this.logger.warn('Connection rejected: no chargePointId provided');
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection.
   */
  handleDisconnect(client: Socket): void {
    const chargePointId = Array.from(this.connectedClients.entries())
      .find(([, socket]) => socket === client)?.[0];

    if (chargePointId) {
      this.connectedClients.delete(chargePointId);
      this.logger.log(`❌ ChargePoint disconnected: ${chargePointId}`);
      this.server.emit('charge-point:disconnected', { chargePointId });
    }
  }

  /**
   * Listen for incoming OCPP messages from ChargePoint.
   */
  @SubscribeMessage('ocpp:message')
  handleOcppMessage(client: Socket, data: any): void {
    const chargePointId = client.handshake.query.chargePointId as string;
    this.logger.debug(
      `📨 OCPP message from ${chargePointId}: ${JSON.stringify(data)}`,
    );

    this.server.emit('ocpp:message', {
      chargePointId,
      payload: data,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast ChargePoint status change to all connected clients.
   */
  broadcastChargePointStatus(chargePointId: string, status: string): void {
    this.logger.log(`📡 Status: ${chargePointId} → ${status}`);
    this.server.emit('charge-point:status-changed', {
      chargePointId,
      status,
      timestamp: new Date(),
    });
  }

  /**
   * Send message to specific ChargePoint.
   */
  sendToChargePoint(chargePointId: string, message: any): void {
    const socket = this.connectedClients.get(chargePointId);

    if (socket) {
      socket.emit('ocpp:command', message);
      this.logger.debug(
        `🚀 Command sent to ${chargePointId}: ${JSON.stringify(message)}`,
      );
    } else {
      this.logger.warn(`⚠️ ChargePoint not connected: ${chargePointId}`);
    }
  }

  /**
   * Get all connected ChargePoints.
   */
  getConnectedChargePoints(): string[] {
    return Array.from(this.connectedClients.keys());
  }
}
