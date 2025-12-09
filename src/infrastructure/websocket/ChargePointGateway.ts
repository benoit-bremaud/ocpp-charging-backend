import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { ProcessOcppMessage } from '../../application/use-cases/ProcessOcppMessage';
import { OcppContext } from '../../domain/value-objects/OcppContext';

/**
 * Infrastructure: WebSocket Gateway
 *
 * Receives OCPP messages from ChargePoints via WebSocket
 * Routes to ProcessOcppMessage dispatcher
 * Sends responses back to ChargePoint
 *
 * Per OCPP 1.6:
 * - Client sends: [2, messageId, action, payload]
 * - Server responds: [3, messageId, payload] or [4, messageId, error, msg]
 */
@WebSocketGateway({
  cors: { origin: '*', methods: ['GET', 'POST'] },
  namespace: 'charge-points',
  transports: ['websocket'],
})
@Injectable()
export class ChargePointGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger('ChargePointGateway');

  @WebSocketServer()
  server!: Server;

  private connectedClients: Map<string, Socket> = new Map();

  constructor(private readonly processOcppMessage: ProcessOcppMessage) {}

  /**
   * Handle client connection
   */
  handleConnection(client: Socket): void {
    const chargePointId = client.handshake.query.chargePointId as string;

    if (chargePointId) {
      this.connectedClients.set(chargePointId, client);
      this.logger.log(`✅ ChargePoint connected: ${chargePointId}`);
      this.server.emit('chargepoint:connected', { chargePointId });
    } else {
      this.logger.warn('Connection rejected: missing chargePointId');
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket): void {
    const cpId = Array.from(this.connectedClients.entries()).find(
      ([, socket]) => socket === client,
    )?.[0];

    if (cpId) {
      this.connectedClients.delete(cpId);
      this.logger.log(`❌ ChargePoint disconnected: ${cpId}`);
      this.server.emit('chargepoint:disconnected', { chargePointId: cpId });
    }
  }

  /**
   * Handle incoming OCPP message
   *
   * Format: [2, messageId, "Action", {payload}]
   */
  @SubscribeMessage('ocpp:message')
  async handleOcppMessage(client: Socket, data: unknown[]): Promise<void> {
    const chargePointId = client.handshake.query.chargePointId as string;
    const sourceIp = client.handshake.address;

    try {
      // Extract messageId from wire format [2, messageId, ...]
      const messageId = data[1];

      // Create OCPP context
      const context = new OcppContext(chargePointId, messageId as string, sourceIp);

      // Route to dispatcher
      const response = await this.processOcppMessage.execute(data, context);

      // Send response back to ChargePoint per OCPP 1.6
      // Response format: [3, messageId, payload] or [4, messageId, error, msg]
      client.emit('ocpp:response', response);

      // Broadcast event to monitoring clients
      this.server.emit('ocpp:message:received', {
        chargePointId,
        messageId,
        timestamp: new Date(),
      });

      this.logger.debug(`✅ Response sent to ${chargePointId}`);
    } catch (error) {
      this.logger.error(`Message processing error from ${chargePointId}: ${error}`);
      client.emit('ocpp:error', {
        message: 'Internal server error',
      });
    }
  }

  /**
   * Send command to specific ChargePoint (Server → Client)
   *
   * This is for server-initiated messages (push commands)
   * Format: [2, messageId, "Action", {payload}]
   */
  sendCommandToChargePoint(
    chargePointId: string,
    messageId: string,
    action: string,
    payload: Record<string, unknown>,
  ): boolean {
    const socket = this.connectedClients.get(chargePointId);
    if (!socket) {
      this.logger.warn(`ChargePoint not connected: ${chargePointId}`);
      return false;
    }

    const command = [2, messageId, action, payload];
    socket.emit('ocpp:command', command);
    this.logger.log(`📤 Command sent to ${chargePointId}: ${action}`);
    return true;
  }

  /**
   * Get all connected ChargePoints
   */
  getConnectedChargePoints(): string[] {
    return Array.from(this.connectedClients.keys());
  }

  /**
   * Check if ChargePoint is connected
   */
  isConnected(chargePointId: string): boolean {
    return this.connectedClients.has(chargePointId);
  }
}
