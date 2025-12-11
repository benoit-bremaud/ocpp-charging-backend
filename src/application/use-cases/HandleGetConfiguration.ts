import { Injectable, Logger } from '@nestjs/common';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../dto/OcppProtocol';

type OcppCallResult = [number, string, Record<string, unknown>];
type OcppCallError = [number, string, string, string];
type OcppResponse = OcppCallResult | OcppCallError;

@Injectable()
export class HandleGetConfiguration {
  private readonly logger = new Logger(HandleGetConfiguration.name);

  async execute(
    message: OcppCallRequest,
    context: OcppContext,
  ): Promise<OcppResponse> {
    if (message.messageTypeId !== 2) {
      return [4, message.messageId, 'GenericError', 'Invalid messageTypeId'];
    }

    const payload = message.payload as {
      key?: string[];
    };

    this.logger.debug(
      `[${context.chargePointId}] GetConfiguration - Keys: ${payload.key?.length || 0}`,
    );

    return [
      3,
      message.messageId,
      {
        configurationKey: [],
        unknownKey: payload.key || [],
      },
    ];
  }
}
