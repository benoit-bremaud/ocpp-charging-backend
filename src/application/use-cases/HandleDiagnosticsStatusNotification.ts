import { Injectable } from '@nestjs/common';
import { DiagnosticsStatusNotificationInput } from '../dto/input/DiagnosticsStatusNotificationInput';

@Injectable()
export class HandleDiagnosticsStatusNotification {
  async execute(chargePointId: string, input: DiagnosticsStatusNotificationInput) {
    console.log(`DiagnosticsStatusNotification received for ${chargePointId}: ${input.status}`);
    return {};
  }
}
