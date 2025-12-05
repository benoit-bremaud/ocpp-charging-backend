import { Injectable, Logger } from '@nestjs/common';
import { OcppMessage } from '../../domain/value-objects/OcppMessage';
import { toOcppMessage, OcppMessageInput } from '../dto/OcppMessageInput';

/**
 * Use-Case: Process incoming OCPP message and route to handlers.
 *
 * CLEAN: Application layer orchestrates message processing.
 * SOLID: SRP - routes messages, delegates to specific handlers.
 */
@Injectable()
export class ProcessOcppMessage {
  private logger = new Logger('ProcessOcppMessage');

  /**
   * Execute: process OCPP message and return appropriate response.
   */
  async execute(input: OcppMessageInput): Promise<Record<string, any>> {
    const message = toOcppMessage(input);

    if (!message.isCall()) {
      this.logger.debug(
        `Non-CALL message type: ${message.messageTypeId} (ignored)`,
      );
      return { status: 'ignored' };
    }

    // Route to specific handler based on action
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
      return await handler(message);
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
   */
  private getHandler(
    action: string,
  ): ((msg: OcppMessage) => Promise<Record<string, any>>) | null {
    const handlers: Record<
      string,
      (msg: OcppMessage) => Promise<Record<string, any>>
    > = {
      // Handlers will be registered here in STEP 11+
    };

    return handlers[action] || null;
  }

  /**
   * Build OCPP error response.
   */
  private buildErrorResponse(
    messageId: string,
    errorCode: string,
    errorMessage: string,
  ): Record<string, any> {
    return [4, messageId, errorCode, errorMessage];
  }
}
