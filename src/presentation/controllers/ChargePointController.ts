import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { SelectChargePoint } from '../../application/use-cases/SelectChargePoint';
import { CreateChargePoint } from '../../application/use-cases/CreateChargePoint';
import { ChargePoint } from '../../domain/entities/ChargePoint.entity';
import { CreateChargePointInput } from '../../application/dto/CreateChargePointInput';

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
    private readonly createChargePointUseCase: CreateChargePoint,
  ) {}

  /**
   * GET /charge-points/:chargePointId
   * Retrieve a ChargePoint by its business identifier
   */
  @Get(':chargePointId')
  @HttpCode(HttpStatus.OK)
  async getChargePointById(
    @Param('chargePointId') chargePointId: string,
  ): Promise<ChargePoint> {
    try {
      return await this.selectChargePointUseCase.execute(chargePointId);
    } catch (error) {
      if (error instanceof Error && error.message.includes('must not be empty')) {
        throw new BadRequestException('chargePointId must not be empty');
      }

      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  /**
   * POST /charge-points
   * Create a new ChargePoint
   *
   * HTTP:
   * - 201 Created: ChargePoint created
   * - 400 Bad Request: invalid payload
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createChargePoint(
    @Body() body: CreateChargePointInput,
  ): Promise<ChargePoint> {
    try {
      return await this.createChargePointUseCase.execute(body);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Field')) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
