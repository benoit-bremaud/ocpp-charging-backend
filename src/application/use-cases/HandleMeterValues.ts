import { Injectable, Logger } from '@nestjs/common';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../dto/OcppProtocol';

type OcppCallResult = [number, string, Record<string, unknown>];
type OcppCallError = [number, string, string, string];
type OcppResponse = OcppCallResult | OcppCallError;

@Injectable()
export class HandleMeterValues {
  private readonly logger = new Logger(HandleMeterValues.name);

  async execute(
    message: OcppCallRequest,
    context: OcppContext,
  ): Promise<OcppResponse> {
    // Validate CALL messageTypeId
    if (message.messageTypeId !== 2) {
      this.logger.error(
        `MeterValues expects CALL messageTypeId 2, got ${message.messageTypeId}`,
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
      transactionId?: number;
      meterValue?: Array<{
        timestamp?: string;
        sampledValue?: Array<{
          value?: string;
          context?: string;
          format?: string;
          measurand?: string;
          phase?: string;
          location?: string;
          unit?: string;
        }>;
      }>;
    };

    this.logger.debug(
      `[${context.chargePointId}] MeterValues - ConnectorId: ${payload.connectorId}, TransactionId: ${payload.transactionId}`,
    );

    // Return CALLRESULT
    return [
      3, // CALLRESULT
      message.messageId,
      {},
    ];
  }
}
