import { Injectable, Logger } from '@nestjs/common';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../dto/OcppProtocol';

type OcppCallResult = [number, string, Record<string, unknown>];
type OcppCallError = [number, string, string, string];
type OcppResponse = OcppCallResult | OcppCallError;

@Injectable()
export class HandleReset {
  private readonly logger = new Logger(HandleReset.name);

  async execute(message: OcppCallRequest, context: OcppContext): Promise<OcppResponse> {
    // Validate CALL messageTypeId
    if (message.messageTypeId !== 2) {
      this.logger.error(`Reset expects CALL messageTypeId 2, got ${message.messageTypeId}`);
      return [
        4, // CALLERROR
        message.messageId,
        'GenericError',
        'Invalid messageTypeId',
      ];
    }

    const payload = message.payload as {
      type?: string;
    };

    this.logger.debug(`[${context.chargePointId}] Reset - Type: ${payload.type}`);

    // Return CALLRESULT with Accepted status
    return [
      3, // CALLRESULT
      message.messageId,
      {
        status: 'Accepted',
      },
    ];
  }
}
