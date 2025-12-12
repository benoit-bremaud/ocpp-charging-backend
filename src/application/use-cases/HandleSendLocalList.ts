import { Injectable, Logger } from '@nestjs/common';

import { OcppCallRequest } from '../dto/OcppProtocol';
import { OcppContext } from '../../domain/value-objects/OcppContext';

interface LocalAuthEntry {
  idTag: string;
  idTokenInfo?: {
    status: string;
    expiryDate?: string;
    parentIdTag?: string;
  };
}
interface SendLocalListPayload {
  listVersion?: number;
  localAuthorizationList?: LocalAuthEntry[];
  updateType?: 'Full' | 'Differential';
}

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

    const payload = message.payload as SendLocalListPayload;

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
