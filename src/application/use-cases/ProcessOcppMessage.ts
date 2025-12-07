import { Injectable, Logger } from '@nestjs/common';
import { OcppCallRequest, deserializeOcppMessage } from '../dto/OcppProtocol';

import { HandleAuthorize } from './HandleAuthorize';
import { HandleBootNotification } from './HandleBootNotification';
import { HandleHeartbeat } from './HandleHeartbeat';
import { HandleStatusNotification } from './HandleStatusNotification';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { buildNotImplemented } from '../dto/OcppResponseBuilders';

/**
 * Use-Case: OCPP Message Dispatcher
 * Routes incoming OCPP CALL requests to appropriate handlers
 * Ensures all messages are handled consistently per OCPP 1.6
 *
 * CLEAN Architecture:
 * - Routes only, no business logic
 * - OCPP Deserializes/serializes per spec
 */
@Injectable()
export class ProcessOcppMessage {
  private logger = new Logger(ProcessOcppMessage.name);

  constructor(
    private readonly handleBootNotification: HandleBootNotification,
    private readonly handleHeartbeat: HandleHeartbeat,
    private readonly handleStatusNotification: HandleStatusNotification,
    private readonly handleAuthorize: HandleAuthorize, // ✅ AJOUTÉ
  ) {}

  /**
   * Execute: Route OCPP message to handler
   * @param rawMessage Wire format [2, messageId, action, payload]
   * @param context OCPP context (chargePointId, etc.)
   * @returns Response in wire format [3, messageId, payload] or [4, messageId, error, msg]
   */
  async execute(rawMessage: any, context: OcppContext): Promise<any> {
    try {
      // Deserialize wire format to OcppMessage
      const message = deserializeOcppMessage(rawMessage);

      // Only process CALL messages
      if (message.messageTypeId !== 2) {
        this.logger.debug(`Non-CALL message (type ${message.messageTypeId}), ignoring`);
        return { status: 'ignored' };
      }

      const callMessage = message as OcppCallRequest;

      // Get handler for this action
      const handler = this.getHandler(callMessage.action);
      if (!handler) {
        return buildNotImplemented(context.messageId, callMessage.action);
      }

      this.logger.debug(`Processing ${callMessage.action} from ${context.chargePointId}`);

      // Execute handler and get response
      const response = await handler(callMessage, context);
      this.logger.debug(`Response sent: ${JSON.stringify(response)}`);
      return response;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Dispatcher error: ${msg}`, error instanceof Error ? error.stack : '');
      return [4, context.messageId, 'InternalError', msg];
    }
  }

  /**
   * Get handler for OCPP action
   */
  private getHandler(
    action: string,
  ): ((msg: OcppCallRequest, ctx: OcppContext) => Promise<any>) | null {
    const handlers: Record<string, (msg: OcppCallRequest, ctx: OcppContext) => Promise<any>> = {
      BootNotification: (msg, ctx) => this.handleBootNotification.execute(msg, ctx),
      Heartbeat: (msg, ctx) => this.handleHeartbeat.execute(msg, ctx),
      StatusNotification: (msg, ctx) => this.handleStatusNotification.execute(msg, ctx),
      Authorize: (msg, ctx) => this.handleAuthorize.execute(msg, ctx), // ✅ AJOUTÉ
    };

    return handlers[action] || null;
  }
}
