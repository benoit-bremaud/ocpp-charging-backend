import { Injectable, Logger } from '@nestjs/common';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../dto/OcppProtocol';

type OcppCallResult = [number, string, Record<string, unknown>];
type OcppCallError = [number, string, string, string];
type OcppResponse = OcppCallResult | OcppCallError;

@Injectable()
export class HandleStopTransaction {
  private readonly logger = new Logger(HandleStopTransaction.name);

  async execute(
    message: OcppCallRequest,
    context: OcppContext,
  ): Promise<OcppResponse> {
    // Validate CALL messageTypeId
    if (message.messageTypeId !== 2) {
      this.logger.error(
        `StopTransaction expects CALL messageTypeId 2, got ${message.messageTypeId}`,
      );
      return [
        4, // CALLERROR
        message.messageId,
        'GenericError',
        'Invalid messageTypeId',
      ];
    }

    const payload = message.payload as {
      transactionId?: number;
      meterStop?: number;
      timestamp?: string;
      reason?: string;
    };

    this.logger.debug(
      `[${context.chargePointId}] StopTransaction - TransactionId: ${payload.transactionId}, MeterStop: ${payload.meterStop}`,
    );

    // Return CALLRESULT with idTagInfo
    return [
      3, // CALLRESULT
      message.messageId,
      {
        idTagInfo: {
          status: 'Accepted',
        },
      },
    ];
  }
}
