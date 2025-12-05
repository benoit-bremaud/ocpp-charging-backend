import { Injectable, Logger, Inject } from '@nestjs/common';
import { OcppMessage } from '../../domain/value-objects/OcppMessage';
import { toOcppMessage, OcppMessageInput } from '../dto/OcppMessageInput';
import { HandleBootNotification } from './HandleBootNotification';
import { HandleHeartbeat } from './HandleHeartbeat';
import { HandleStatusNotification } from './HandleStatusNotification';

/**
 * Use-Case: Process incoming OCPP message and route to handlers.
 *
 * Dispatcher Pattern:
 * 1. Parse incoming OCPP message
 * 2. Validate message format (OcppMessage)
 * 3. Lookup handler by action name
 * 4. Execute handler or return NotImplemented error
 *
 * CLEAN: Application layer orchestrates message routing.
 * SOLID: SRP - routes only, handlers in separate classes.
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
   * Execute: process OCPP message and route to appropriate handler.
   * 
   * @param input Raw OCPP message input
   * @param chargePointId From WebSocket context (query params)
   */
  async execute(
    input: OcppMessageInput,
    chargePointId: string = 'CP-UNKNOWN',
  ): Promise<Record<string, any>> {
    const message = toOcppMessage(input);

    // Only process CALL messages (requests from ChargePoint)
    if (!message.isCall()) {
      this.logger.debug(
        `Non-CALL message type: ${message.messageTypeId} (ignored)`,
      );
      return { status: 'ignored' };
    }

    // Get handler for this action
    const handler = this.getHandler(message.action);

    if (!handler) {
      this.logger.warn(
        `No handler registered for action: ${message.action}`,
      );
      return this.buildErrorResponse(
        message.messageId,
        'NotImplemented',
        `Handler for ${message.action} not implemented`,
      );
    }

    try {
      this.logger.debug(
        `Processing ${message.action} (messageId: ${message.messageId})`,
      );
      // Execute handler with chargePointId context
      return await handler(message, chargePointId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error processing ${message.action}: ${errorMessage}`,
        error instanceof Error ? error.stack : '',
      );
      return this.buildErrorResponse(
        message.messageId,
        'InternalError',
        errorMessage,
      );
    }
  }

  /**
   * Get handler function for specific OCPP action.
   * 
   * Handler Registry (extensible):
   * - BootNotification: ChargePoint boot/registration
   * - Heartbeat: Keep-alive probe
   * - StatusNotification: Connector status changes
   * - [Future handlers added here]
   */
  private getHandler(
    action: string,
  ): ((msg: OcppMessage, cpId: string) => Promise<Record<string, any>>) | null {
    const handlers: Record<
      string,
      (msg: OcppMessage, cpId: string) => Promise<Record<string, any>>
    > = {
      BootNotification: (msg, cpId) =>
        this.handleBootNotification.execute(msg, cpId),
      Heartbeat: (msg, cpId) =>
        this.handleHeartbeat.execute(msg, cpId),
      StatusNotification: (msg, cpId) =>
        this.handleStatusNotification.execute(msg, cpId),
      // [Future handlers]
      // Authorize: (msg, cpId) => this.handleAuthorize.execute(msg, cpId),
      // MeterValues: (msg, cpId) => this.handleMeterValues.execute(msg, cpId),
    };

    return handlers[action] || null;
  }

  /**
   * Build OCPP error response [4, messageId, errorCode, errorMessage].
   */
  private buildErrorResponse(
    messageId: string,
    errorCode: string,
    errorMessage: string,
  ): Record<string, any> {
    return [4, messageId, errorCode, errorMessage];
  }
}
