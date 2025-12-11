import { Injectable, Logger } from '@nestjs/common';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../dto/OcppProtocol';

type OcppCallResult = [number, string, Record<string, unknown>];
type OcppCallError = [number, string, string, string];
type OcppResponse = OcppCallResult | OcppCallError;

@Injectable()
export class HandleGetDiagnostics {
  private readonly logger = new Logger(HandleGetDiagnostics.name);

  async execute(
    message: OcppCallRequest,
    context: OcppContext,
  ): Promise<OcppResponse> {
    if (message.messageTypeId !== 2) {
      return [4, message.messageId, 'GenericError', 'Invalid messageTypeId'];
    }

    this.logger.debug(`[${context.chargePointId}] GetDiagnostics requested`);

    return [
      3,
      message.messageId,
      {
        fileName: `diagnostics-${Date.now()}.zip`,
      },
    ];
  }
}
