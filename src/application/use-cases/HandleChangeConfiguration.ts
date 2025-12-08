import { Injectable, Inject } from '@nestjs/common';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';
import { ChangeConfigurationInput } from '../dto/input/ChangeConfigurationInput';
import { ChangeConfigurationOutput } from '../dto/output/ChangeConfigurationOutput';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';

/**
 * Handle ChangeConfiguration use case
 * OCPP § 3.20 - Change configuration settings
 */
@Injectable()
export class HandleChangeConfiguration {
  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepo: IChargePointRepository
  ) {}

  async execute(
    input: ChangeConfigurationInput,
  ): Promise<ChangeConfigurationOutput> {
    if (!input.key || !input.value) {
      return ChangeConfigurationOutput.rejected();
    }

    const chargePoint = await this.chargePointRepo.find(input.chargePointId);
    if (!chargePoint) {
      return ChangeConfigurationOutput.rejected();
    }

    // Some keys require reboot
    if (['AuthorizationKey', 'SecurityProfile'].includes(input.key)) {
      return ChangeConfigurationOutput.rebootRequired();
    }

    return ChangeConfigurationOutput.accepted();
  }
}
