import { OcppMessage } from '../../domain/value-objects/OcppMessage';

/**
 * DTO: OCPP message input from ChargePoint (WebSocket).
 *
 * CLEAN: Application layer, maps HTTP/WebSocket to domain.
 */
export interface OcppMessageInput {
  messageTypeId: number;
  messageId: string;
  action: string;
  payload: Record<string, unknown>;
}

/**
 * Map incoming OCPP message to domain value object.
 */
export function toOcppMessage(input: OcppMessageInput): OcppMessage {
  return new OcppMessage(input.messageTypeId, input.messageId, input.action, input.payload);
}
