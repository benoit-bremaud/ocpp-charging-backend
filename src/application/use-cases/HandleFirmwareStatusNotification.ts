import { Injectable } from '@nestjs/common';
import { FirmwareStatusNotificationInput } from '../dto/input/FirmwareStatusNotificationInput';
import { FirmwareStatusNotificationOutput } from '../dto/output/FirmwareStatusNotificationOutput';

/**
 * OCPP 1.6 § 4.10 - FirmwareStatusNotification
 */
@Injectable()
export class HandleFirmwareStatusNotification {
  async execute(
    chargePointId: string,
    input: FirmwareStatusNotificationInput,
  ): Promise<FirmwareStatusNotificationOutput> {
    // Log la notification et retourner une réponse vide (OK pour OCPP)
    console.log(`FirmwareStatusNotification received for ${chargePointId}: ${input.status}`);
    return {
      status: input.status,
    };
  }
}
