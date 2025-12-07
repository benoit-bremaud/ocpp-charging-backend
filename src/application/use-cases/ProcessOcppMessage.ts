import { Injectable, Logger } from '@nestjs/common';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppCallRequest, deserializeOcppMessage } from '../dto/OcppProtocol';
import { buildNotImplemented } from '../dto/OcppResponseBuilders';
import { HandleBootNotification } from './HandleBootNotification';
import { HandleHeartbeat } from './HandleHeartbeat';
import { HandleStatusNotification } from './HandleStatusNotification';

/**
 * Use-Case: OCPP Message Dispatcher
 */
@Injectable()
export class ProcessOcppMessage {
  private logger = new Logger('ProcessOcppMessage');

  constructor(
    private readonly handleBootNotification: HandleBootNotification,
    private readonly handleHeartbeat: HandleHeartbeat,
    private readonly handleStatusNotification: HandleStatusNotification,
  ) {}

  /**
   * Execute: Route OCPP message to handler
   *
   * @param rawMessage Wire format [2, messageId, action, payload]
   * @param context OCPP context (chargePointId, etc.)
   * @returns Response in wire format [3, messageId, payload] or [4, messageId, error, msg] or ignored
   */
  async execute(rawMessage: any[], context: OcppContext): Promise<any[] | { status: string }> {
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
  ): ((msg: OcppCallRequest, ctx: OcppContext) => Promise<any[]>) | null {
    const handlers: Record<string, (msg: OcppCallRequest, ctx: OcppContext) => Promise<any[]>> = {
      BootNotification: (msg, ctx) => this.handleBootNotification.execute(msg, ctx),
      Heartbeat: (msg, ctx) => this.handleHeartbeat.execute(msg, ctx),
      StatusNotification: (msg, ctx) => this.handleStatusNotification.execute(msg, ctx),
    };

    return handlers[action] || null;
  }
}
