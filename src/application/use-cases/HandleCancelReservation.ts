import { Injectable } from '@nestjs/common';
import { CancelReservationInput } from '../dto/input/CancelReservationInput';

@Injectable()
export class HandleCancelReservation {
  async execute(chargePointId: string, input: CancelReservationInput) {
    console.log(`CancelReservation received for ${chargePointId}: reservation ${input.reservationId}`);
    return { status: 'Accepted' as const };
  }
}
