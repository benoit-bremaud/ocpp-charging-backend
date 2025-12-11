import { Injectable, Logger, Inject } from '@nestjs/common';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../dto/OcppProtocol';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';

type OcppCallResult = [number, string, Record<string, unknown>];
type OcppCallError = [number, string, string, string];
type OcppResponse = OcppCallResult | OcppCallError;

@Injectable()
export class HandleStartTransaction {
  private readonly logger = new Logger(HandleStartTransaction.name);

  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly repository: IChargePointRepository,
  ) {}

  async execute(message: OcppCallRequest, context: OcppContext): Promise<OcppResponse> {
    // Validate CALL messageTypeId
    if (message.messageTypeId !== 2) {
      this.logger.error(
        `StartTransaction expects CALL messageTypeId 2, got ${message.messageTypeId}`,
      );
      return [
        4, // CALLERROR
        message.messageId,
        'GenericError',
        'Invalid messageTypeId',
      ];
    }

    const payload = message.payload as {
      connectorId?: number;
      idTag?: string;
      timestamp?: string;
      meterStart?: number;
    };

    // Validate required fields
    if (payload.connectorId === undefined) {
      this.logger.error('StartTransaction missing required field: connectorId');
      return [
        4, // CALLERROR
        message.messageId,
        'GenericError',
        'Missing required field: connectorId',
      ];
    }

    if (!payload.idTag) {
      this.logger.error('StartTransaction missing required field: idTag');
      return [
        4, // CALLERROR
        message.messageId,
        'GenericError',
        'Missing required field: idTag',
      ];
    }

    if (payload.meterStart === undefined) {
      this.logger.error('StartTransaction missing required field: meterStart');
      return [
        4, // CALLERROR
        message.messageId,
        'GenericError',
        'Missing required field: meterStart',
      ];
    }

    // Check if ChargePoint exists
    const chargePoint = await this.repository.findByChargePointId(context.chargePointId);
    if (!chargePoint) {
      this.logger.error(`ChargePoint ${context.chargePointId} not found`);
      return [
        4, // CALLERROR
        message.messageId,
        'GenericError',
        `ChargePoint ${context.chargePointId} not found`,
      ];
    }

    this.logger.debug(
      `[${context.chargePointId}] StartTransaction - ConnectorId: ${payload.connectorId}, IdTag: ${payload.idTag}`,
    );

    // Return CALLRESULT with transaction confirmation
    return [
      3, // CALLRESULT
      message.messageId,
      {
        transactionId: Math.floor(Math.random() * 1000000),
        idTagInfo: {
          status: 'Accepted',
        },
      },
    ];
  }
}
