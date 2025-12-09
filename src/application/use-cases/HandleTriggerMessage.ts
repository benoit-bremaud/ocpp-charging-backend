import { Injectable, Inject } from '@nestjs/common';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';
import { TriggerMessageInput } from '../dto/input/TriggerMessageInput';
import { TriggerMessageOutput } from '../dto/output/TriggerMessageOutput';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';

/**
 * Handle TriggerMessage use case
 * OCPP § 3.19 - Trigger charge point message
 */
@Injectable()
export class HandleTriggerMessage {
  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepo: IChargePointRepository,
  ) {}

  async execute(input: TriggerMessageInput): Promise<TriggerMessageOutput> {
    if (!input.requestedMessage) {
      return TriggerMessageOutput.rejected();
    }

    const chargePoint = await this.chargePointRepo.find(input.chargePointId);
    if (!chargePoint) {
      return TriggerMessageOutput.rejected();
    }

    return TriggerMessageOutput.accepted();
  }
}
