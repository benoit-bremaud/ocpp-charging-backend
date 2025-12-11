import { Injectable, Logger } from '@nestjs/common';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../dto/OcppProtocol';

type OcppCallResult = [number, string, Record<string, unknown>];
type OcppCallError = [number, string, string, string];
type OcppResponse = OcppCallResult | OcppCallError;

@Injectable()
export class HandleFirmwareStatusNotification {
  private readonly logger = new Logger(HandleFirmwareStatusNotification.name);

  async execute(message: OcppCallRequest, context: OcppContext): Promise<OcppResponse> {
    // Validate CALL messageTypeId
    if (message.messageTypeId !== 2) {
      this.logger.error(
        `FirmwareStatusNotification expects CALL messageTypeId 2, got ${message.messageTypeId}`,
      );
      return [
        4, // CALLERROR
        message.messageId,
        'GenericError',
        'Invalid messageTypeId',
      ];
    }

    const payload = message.payload as {
      status?: string;
      requestId?: number;
    };

    this.logger.debug(
      `[${context.chargePointId}] FirmwareStatusNotification - Status: ${payload.status}, RequestId: ${payload.requestId}`,
    );

    // Return CALLRESULT
    return [
      3, // CALLRESULT
      message.messageId,
      {},
    ];
  }
}
