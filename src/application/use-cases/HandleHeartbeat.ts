import { Injectable, Logger } from '@nestjs/common';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../dto/OcppProtocol';

type OcppCallResult = [number, string, Record<string, unknown>];
type OcppCallError = [number, string, string, string];
type OcppResponse = OcppCallResult | OcppCallError;

@Injectable()
export class HandleHeartbeat {
  private readonly logger = new Logger(HandleHeartbeat.name);

  async execute(message: OcppCallRequest, context: OcppContext): Promise<OcppResponse> {
    // Validate CALL messageTypeId
    if (message.messageTypeId !== 2) {
      this.logger.error(`Heartbeat expects CALL messageTypeId 2, got ${message.messageTypeId}`);
      return [
        4, // CALLERROR
        message.messageId,
        'GenericError',
        'Invalid messageTypeId',
      ];
    }

    const currentTime = new Date().toISOString();
    this.logger.debug(`[${context.chargePointId}] Heartbeat received at ${currentTime}`);

    // Return CALLRESULT with current server time
    return [
      3, // CALLRESULT
      message.messageId,
      {
        currentTime,
      },
    ];
  }
}
