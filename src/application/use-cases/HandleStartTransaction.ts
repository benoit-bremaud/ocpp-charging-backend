import { Inject, Injectable, Logger } from '@nestjs/common';

import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppSchema } from '../../domain/value-objects/OcppSchema';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';
import { OcppCallRequest } from '../dto/OcppProtocol';
import {
  buildGenericError,
  buildFormationViolation,
  buildDataTransferResponse,
} from '../dto/OcppResponseBuilders';

/**
 * Use-Case: Handle StartTransaction (OCPP 1.6 Compliant)
 *
 * OCPP 1.6 Spec:
 * - ChargePoint sends StartTransaction.req
 * - Central System responds with StartTransaction.conf
 * - Includes transactionId and idTagInfo (Accepted/Blocked/etc)
 */
@Injectable()
export class HandleStartTransaction {
  private logger = new Logger('HandleStartTransaction');

  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepository: IChargePointRepository,
  ) {}

  async execute(message: OcppCallRequest, context: OcppContext): Promise<unknown[]> {
    if (message.messageTypeId !== 2) {
      this.logger.error('StartTransaction expects CALL (messageTypeId 2)');
      return buildGenericError(context.messageId, 'Expected CALL message type');
    }

    const validation = OcppSchema.validate('StartTransaction', message.payload);
    if (!validation.valid) {
      this.logger.warn(`StartTransaction validation failed: ${validation.errors?.join('; ')}`);
      return buildFormationViolation(
        context.messageId,
        validation.errors?.join('; ') || 'Schema validation failed',
      );
    }

    const chargePoint = await this.chargePointRepository.findByChargePointId(context.chargePointId);

    if (!chargePoint) {
      this.logger.warn(`ChargePoint not found: ${context.chargePointId}`);
      return buildGenericError(context.messageId, `ChargePoint ${context.chargePointId} not found`);
    }

    // Extract payload
    const payload = message.payload as any;
    const connectorId = payload.connectorId as number;
    const idTag = payload.idTag as string;
    const meterStart = payload.meterStart as number;

    if (!connectorId || !idTag || meterStart === undefined) {
      this.logger.warn(`StartTransaction missing required fields from ${context.chargePointId}`);
      return buildFormationViolation(
        context.messageId,
        'Missing required fields: connectorId, idTag, meterStart',
      );
    }

    // Generate transaction ID (in real system, would come from DB)
    const transactionId = Math.floor(Date.now() / 1000);

    this.logger.log(
      `✅ StartTransaction accepted for ${context.chargePointId} connector ${connectorId}, txId: ${transactionId}`,
    );

    // Return StartTransaction.conf with transactionId and idTagInfo
    return [
      3,
      context.messageId,
      {
        transactionId,
        idTagInfo: {
          status: 'Accepted',
        },
      },
    ];
  }
}
