/**
 * Value Object: OCPP Message Context
 *
 * Contains all metadata about an OCPP message:
 * - chargePointId: Identifier from WebSocket query
 * - timestamp: When message was received
 * - sourceIp: Client IP address
 * - messageId: OCPP message ID
 */
export class OcppContext {
  readonly chargePointId: string;
  readonly timestamp: Date;
  readonly sourceIp?: string;
  readonly messageId: string;

  constructor(chargePointId: string, messageId: string, sourceIp?: string, timestamp?: Date) {
    if (!chargePointId) {
      throw new Error('chargePointId is required');
    }
    if (!messageId) {
      throw new Error('messageId is required');
    }

    this.chargePointId = chargePointId;
    this.messageId = messageId;
    this.sourceIp = sourceIp;
    this.timestamp = timestamp || new Date();
  }

  /**
   * Create context from WebSocket connection
   */
  static fromWebSocket(
    query: Record<string, string>,
    messageId: string,
    sourceIp?: string,
  ): OcppContext {
    return new OcppContext(query.chargePointId, messageId, sourceIp);
  }
}
