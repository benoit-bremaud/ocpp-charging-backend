import { Injectable, Logger } from '@nestjs/common';

import { OcppCallRequest } from '../dto/OcppProtocol';
import { OcppContext } from '../../domain/value-objects/OcppContext';

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
      localAuthorizationList?: Array<{
        idTag: string;
        idTagInfo: { status: string };
      }>;
      updateType?: string;
    };

    // SPEC: Validate required fields
    if (!payload.listVersion || !payload.updateType) {
      return [3, message.messageId, { status: 'Failed' }];
    }

    // SPEC: Validate updateType is Full or Differential
    if (!['Full', 'Differential'].includes(payload.updateType)) {
      return [3, message.messageId, { status: 'Failed' }];
    }

    // SPEC: Check for duplicate idTags
    const idTags = (payload.localAuthorizationList || []).map((item) => item.idTag);
    if (new Set(idTags).size !== idTags.length) {
      return [3, message.messageId, { status: 'Failed' }];
    }

    this.logger.debug(
      `[${context.chargePointId}] SendLocalList - Version: ${payload.listVersion}, UpdateType: ${payload.updateType}`,
    );

    return [3, message.messageId, { status: 'Accepted' }];
  }
}
