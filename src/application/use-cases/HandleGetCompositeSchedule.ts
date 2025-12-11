import { Injectable, Logger } from '@nestjs/common';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppCallRequest } from '../dto/OcppProtocol';

type OcppCallResult = [number, string, Record<string, unknown>];
type OcppCallError = [number, string, string, string];
type OcppResponse = OcppCallResult | OcppCallError;

@Injectable()
export class HandleGetCompositeSchedule {
  private readonly logger = new Logger(HandleGetCompositeSchedule.name);

  async execute(
    message: OcppCallRequest,
    context: OcppContext,
  ): Promise<OcppResponse> {
    if (message.messageTypeId !== 2) {
      this.logger.error(
        `GetCompositeSchedule expects CALL messageTypeId 2, got ${message.messageTypeId}`,
      );
      return [
        4,
        message.messageId,
        'GenericError',
        'Invalid messageTypeId',
      ];
    }

    const payload = message.payload as {
      connectorId?: number;
      duration?: number;
      chargingRateUnit?: string;
    };

    this.logger.debug(
      `[${context.chargePointId}] GetCompositeSchedule - ConnectorId: ${payload.connectorId}`,
    );

    return [
      3,
      message.messageId,
      {
        status: 'Accepted',
        scheduleStart: new Date().toISOString(),
        chargingSchedulePeriod: [],
      },
    ];
  }
}
