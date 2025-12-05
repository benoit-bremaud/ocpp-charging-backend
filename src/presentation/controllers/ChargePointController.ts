import { Controller, Get, Param, HttpCode } from '@nestjs/common';

import { SelectChargePoint } from '../../application/use-cases/SelectChargePoint';
import { ChargePoint } from '../../domain/entities/ChargePoint.entity';

/**
 * Presentation Layer: HTTP API for ChargePoint domain
 *
 * CLEAN: Controller = thin adapter between HTTP and Application layer
 * No business logic here - just HTTP routing + use-case invocation
 *
 * SOLID: SRP - controller only handles HTTP concerns
 */
@Controller('charge-points')
export class ChargePointController {
  constructor(
    private readonly selectChargePointUseCase: SelectChargePoint,
  ) {}

  /**
   * GET /charge-points/:chargePointId
   * Retrieve a ChargePoint by its business identifier
   *
   * @param chargePointId - Business identifier (e.g., "CP-001")
   * @returns ChargePoint entity
   * @throws NotFoundException if ChargePoint not found
   *
   * HTTP:
   * - 200 OK: ChargePoint found and returned
   * - 404 Not Found: ChargePoint does not exist
   * - 400 Bad Request: Invalid chargePointId (empty)
   */
  @Get(':chargePointId')
  @HttpCode(200)
  async getChargePointById(
    @Param('chargePointId') chargePointId: string,
  ): Promise<ChargePoint> {
    /**
     * Delegate to application use-case.
     * Use-case handles all business logic and validation.
     */
    return this.selectChargePointUseCase.execute(chargePointId);
  }
}
