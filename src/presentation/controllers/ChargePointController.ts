import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { SelectChargePoint } from '../../application/use-cases/SelectChargePoint';
import { CreateChargePoint } from '../../application/use-cases/CreateChargePoint';
import { FindAllChargePoints } from '../../application/use-cases/FindAllChargePoints';
import { UpdateChargePoint } from '../../application/use-cases/UpdateChargePoint';
import { DeleteChargePoint } from '../../application/use-cases/DeleteChargePoint';
import { ChargePoint } from '../../domain/entities/ChargePoint.entity';
import { CreateChargePointInput } from '../../application/dto/CreateChargePointInput';
import { UpdateChargePointInput } from '../../application/dto/UpdateChargePointInput';

/**
 * Presentation Layer: HTTP API for ChargePoint domain
 */
@Controller('charge-points')
export class ChargePointController {
  constructor(
    private readonly selectChargePointUseCase: SelectChargePoint,
    private readonly createChargePointUseCase: CreateChargePoint,
    private readonly findAllChargePointsUseCase: FindAllChargePoints,
    private readonly updateChargePointUseCase: UpdateChargePoint,
    private readonly deleteChargePointUseCase: DeleteChargePoint,
  ) {}

  /**
   * GET /charge-points
   * Retrieve all ChargePoints
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllChargePoints(): Promise<ChargePoint[]> {
    return this.findAllChargePointsUseCase.execute();
  }

  /**
   * GET /charge-points/:chargePointId
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

  /**
   * PUT /charge-points/:chargePointId
   * Update an existing ChargePoint
   */
  @Put(':chargePointId')
  @HttpCode(HttpStatus.OK)
  async updateChargePoint(
    @Param('chargePointId') chargePointId: string,
    @Body() body: UpdateChargePointInput,
  ): Promise<ChargePoint> {
    try {
      return await this.updateChargePointUseCase.execute(chargePointId, body);
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
   * DELETE /charge-points/:id
   * Delete a ChargePoint by UUID
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteChargePoint(@Param('id') id: string): Promise<void> {
    try {
      return await this.deleteChargePointUseCase.execute(id);
    } catch (error) {
      if (error instanceof Error && error.message.includes('must not be empty')) {
        throw new BadRequestException('id must not be empty');
      }

      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }
}
