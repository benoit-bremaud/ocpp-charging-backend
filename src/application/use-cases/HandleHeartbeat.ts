import { Injectable, Logger } from '@nestjs/common';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../dto/OcppProtocol';
import { buildHeartbeatResponse, buildGenericError } from '../dto/OcppResponseBuilders';

/**
 * Use-Case: Handle Heartbeat (OCPP 1.6 Compliant)
 *
 * Input:  [2, messageId, "Heartbeat", {}]
 * Output: [3, messageId, {currentTime}]
 * Error:  [4, messageId, errorCode, description]
 *
 * CLEAN: Pure business logic (stateless)
 * OCPP:  Simple heartbeat echo with server time
 */
@Injectable()
export class HandleHeartbeat {
  private logger = new Logger('HandleHeartbeat');

  /**
   * Execute: Handle Heartbeat message
   */
  async execute(message: OcppCallRequest, context: OcppContext): Promise<any[]> {
    // Validate message is CALL
    if (message.messageTypeId !== 2) {
      this.logger.error('Heartbeat expects CALL (messageTypeId 2)');
      return buildGenericError(context.messageId, 'Expected CALL message type');
    }

    this.logger.log(`💓 Heartbeat from ${context.chargePointId}`);

    // Return current server time per OCPP 1.6 spec
    return buildHeartbeatResponse(context.messageId);
  }
}
