import { Injectable, Logger } from '@nestjs/common';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../dto/OcppProtocol';

type OcppCallResult = [number, string, Record<string, unknown>];
type OcppCallError = [number, string, string, string];
type OcppResponse = OcppCallResult | OcppCallError;

@Injectable()
export class HandleUpdateFirmware {
  private readonly logger = new Logger(HandleUpdateFirmware.name);

  async execute(message: OcppCallRequest, context: OcppContext): Promise<OcppResponse> {
    if (message.messageTypeId !== 2) {
      return [4, message.messageId, 'GenericError', 'Invalid messageTypeId'];
    }

    const payload = message.payload as {
      location?: string;
      retrieveDate?: string;
      installDate?: string;
      retries?: number;
      retryInterval?: number;
    };

    this.logger.debug(`[${context.chargePointId}] UpdateFirmware - Location: ${payload.location}`);

    return [3, message.messageId, {}];
  }
}
