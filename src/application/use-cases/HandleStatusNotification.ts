import { Injectable, Logger } from '@nestjs/common';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../dto/OcppProtocol';

type OcppCallResult = [number, string, Record<string, unknown>];
type OcppCallError = [number, string, string, string];
type OcppResponse = OcppCallResult | OcppCallError;

@Injectable()
export class HandleStatusNotification {
  private readonly logger = new Logger(HandleStatusNotification.name);

  async execute(
    message: OcppCallRequest,
    context: OcppContext,
  ): Promise<OcppResponse> {
    // Validate CALL messageTypeId
    if (message.messageTypeId !== 2) {
      this.logger.error(
        `StatusNotification expects CALL messageTypeId 2, got ${message.messageTypeId}`,
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
      status?: string;
      errorCode?: string;
      timestamp?: string;
      vendorId?: string;
      vendorErrorCode?: string;
    };

    this.logger.debug(
      `[${context.chargePointId}] StatusNotification - ConnectorId: ${payload.connectorId}, Status: ${payload.status}`,
    );

    // Return CALLRESULT
    return [
      3, // CALLRESULT
      message.messageId,
      {},
    ];
  }
}
