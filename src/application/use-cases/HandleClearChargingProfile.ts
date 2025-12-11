import { Injectable, Logger } from '@nestjs/common';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../dto/OcppProtocol';

type OcppCallResult = [number, string, Record<string, unknown>];
type OcppCallError = [number, string, string, string];
type OcppResponse = OcppCallResult | OcppCallError;

@Injectable()
export class HandleClearChargingProfile {
  private readonly logger = new Logger(HandleClearChargingProfile.name);

  async execute(message: OcppCallRequest, context: OcppContext): Promise<OcppResponse> {
    // Validate CALL messageTypeId
    if (message.messageTypeId !== 2) {
      this.logger.error(
        `ClearChargingProfile expects CALL messageTypeId 2, got ${message.messageTypeId}`,
      );
      return [
        4, // CALLERROR
        message.messageId,
        'GenericError',
        'Invalid messageTypeId',
      ];
    }

    const { connectorId } = message.payload as { connectorId?: number };

    this.logger.debug(
      `[${context.chargePointId}] ClearChargingProfile - ConnectorId: ${connectorId ?? 'all'}`,
    );

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
