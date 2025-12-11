import { Injectable, Logger } from '@nestjs/common';

import { OcppCallRequest } from '../dto/OcppProtocol';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { buildGenericError } from '../dto/OcppResponseBuilders';

/**
 * Use-Case: Handle OCPP ClearCache Request
 *
 * OCPP 1.6.1 Spec - Remote start transaction
 * Per spec: Central System requests ChargePoint to clear its local authorization cache
 * Request: [2, messageId, "ClearCache", {}]
 * Response: [3, messageId, {status: "Accepted" | "Rejected"}]
 */
@Injectable()
export class HandleClearCache {
  private readonly logger = new Logger(HandleClearCache.name);

  async execute(message: OcppCallRequest, context: OcppContext): Promise<unknown> {
    // Validate messageTypeId is CALL (2)
    if (message.messageTypeId !== 2) {
      this.logger.error(`ClearCache expects CALL messageTypeId 2, got ${message.messageTypeId}`);
      return buildGenericError(context.messageId, 'Expected CALL message type');
    }

    this.logger.log(`ClearCache requested by chargePointId=${context.chargePointId}`);

    // Return CALLRESULT with Accepted status
    return [3, context.messageId, { status: 'Accepted' }];
  }
}
