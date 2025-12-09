import { Injectable, Logger } from '@nestjs/common';
import { buildFormationViolation, buildHeartbeatResponse } from '../dto/OcppResponseBuilders';

import { OcppCallRequest } from '../dto/OcppProtocol';
import { OcppContext } from '../../domain/value-objects/OcppContext';

/**
 * Use-Case: Handle Heartbeat (OCPP 1.6 Spec)
 *
 * ChargePoint requests: "Are you still there?"
 * Backend responds: "Yes, here's the current time"
 *
 * Input: [2, messageId, "Heartbeat", {}]
 * Output: [3, messageId, {currentTime: "ISO-8601"}]
 * Error: [4, messageId, errorCode, description]
 */
@Injectable()
export class HandleHeartbeat {
  private readonly logger = new Logger('HandleHeartbeat');

  /**
   * Execute heartbeat request
   * @param message OCPP CALL message
   * @param context Message metadata
   * @returns OCPP CALLRESULT or CALLERROR array
   */
  async execute(message: OcppCallRequest, context: OcppContext): Promise<unknown[]> {
    // OCPP 1.6: Must be CALL type (messageTypeId = 2)
    if (message.messageTypeId !== 2) {
      this.logger.error(
        `[${context.chargePointId}] Heartbeat expects CALL (messageTypeId 2), got ${message.messageTypeId}`,
      );
      return buildFormationViolation(context.messageId, 'Heartbeat expects CALL message type');
    }

    // OCPP 1.6: Heartbeat payload MUST be empty object {}
    if (typeof message.payload !== 'object' || message.payload === null) {
      this.logger.warn(`[${context.chargePointId}] Heartbeat: payload must be object`);
      return buildFormationViolation(context.messageId, 'Heartbeat payload must be empty object');
    }

    const payloadKeys = Object.keys(message.payload);
    if (payloadKeys.length > 0) {
      this.logger.warn(
        `[${context.chargePointId}] Heartbeat: payload must be empty, got keys: ${payloadKeys.join(', ')}`,
      );
      return buildFormationViolation(context.messageId, 'Heartbeat payload must be empty object');
    }

    this.logger.log(
      `💓 Heartbeat received from chargePointId="${context.chargePointId}" at ${context.timestamp.toISOString()}`,
    );

    // OCPP 1.6: Return CALLRESULT with currentTime
    return buildHeartbeatResponse(context.messageId);
  }
}
