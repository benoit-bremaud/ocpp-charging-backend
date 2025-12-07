import { Injectable } from '@nestjs/common';
import { ReserveNowInput } from '../dto/input/ReserveNowInput';

@Injectable()
export class HandleReserveNow {
  async execute(chargePointId: string, input: ReserveNowInput) {
    console.log(`ReserveNow received for ${chargePointId}: reservation ${input.reservationId}`);
    return { status: 'Accepted' as const };
  }
}
