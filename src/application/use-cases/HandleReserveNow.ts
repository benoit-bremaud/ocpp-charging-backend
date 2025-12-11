import { Injectable, Logger } from '@nestjs/common';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../dto/OcppProtocol';

type OcppCallResult = [number, string, Record<string, unknown>];
type OcppCallError = [number, string, string, string];
type OcppResponse = OcppCallResult | OcppCallError;

@Injectable()
export class HandleReserveNow {
  private readonly logger = new Logger(HandleReserveNow.name);

  async execute(
    message: OcppCallRequest,
    context: OcppContext,
  ): Promise<OcppResponse> {
    // Validate CALL messageTypeId
    if (message.messageTypeId !== 2) {
      this.logger.error(
        `ReserveNow expects CALL messageTypeId 2, got ${message.messageTypeId}`,
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
      expiryDate?: string;
      idTag?: string;
      reservationId?: number;
    };

    this.logger.debug(
      `[${context.chargePointId}] ReserveNow - ConnectorId: ${payload.connectorId}, ReservationId: ${payload.reservationId}`,
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
