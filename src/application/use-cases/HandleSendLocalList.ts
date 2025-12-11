import { Injectable, Logger } from '@nestjs/common';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../dto/OcppProtocol';

type OcppCallResult = [number, string, Record<string, unknown>];
type OcppCallError = [number, string, string, string];
type OcppResponse = OcppCallResult | OcppCallError;

@Injectable()
export class HandleSendLocalList {
  private readonly logger = new Logger(HandleSendLocalList.name);

  async execute(message: OcppCallRequest, context: OcppContext): Promise<OcppResponse> {
    if (message.messageTypeId !== 2) {
      return [4, message.messageId, 'GenericError', 'Invalid messageTypeId'];
    }

    const payload = message.payload as {
      listVersion?: number;
      localAuthorizationList?: any[];
      updateType?: string;
    };

    this.logger.debug(`[${context.chargePointId}] SendLocalList - Version: ${payload.listVersion}`);

    return [
      3,
      message.messageId,
      {
        status: 'Accepted',
      },
    ];
  }
}
