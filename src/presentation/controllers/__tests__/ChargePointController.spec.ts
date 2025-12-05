import { Test, TestingModule } from '@nestjs/testing';
import { ChargePointController } from '../ChargePointController';
import { SelectChargePoint } from '../../../application/use-cases/SelectChargePoint';
import { CreateChargePoint } from '../../../application/use-cases/CreateChargePoint';
import { FindAllChargePoints } from '../../../application/use-cases/FindAllChargePoints';
import { ChargePoint } from '../../../domain/entities/ChargePoint.entity';
import { CreateChargePointInput } from '../../../application/dto/CreateChargePointInput';

describe('ChargePointController', () => {
  let controller: ChargePointController;
  let selectUseCase: { execute: jest.Mock };
  let createUseCase: { execute: jest.Mock };
  let findAllUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    selectUseCase = { execute: jest.fn() };
    createUseCase = { execute: jest.fn() };
    findAllUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChargePointController],
      providers: [
        { provide: SelectChargePoint, useValue: selectUseCase },
        { provide: CreateChargePoint, useValue: createUseCase },
        { provide: FindAllChargePoints, useValue: findAllUseCase },
      ],
    }).compile();

    controller = module.get<ChargePointController>(ChargePointController);
  });

  describe('getAllChargePoints', () => {
    it('should return list of all ChargePoints', async () => {
      const mockChargePoints: Partial<ChargePoint>[] = [
        {
          id: '123',
          chargePointId: 'CP-001',
          chargePointModel: 'Tesla Supercharger',
          chargePointVendor: 'Tesla Inc',
          firmwareVersion: '1.0.0',
          status: 'OFFLINE',
          heartbeatInterval: 900,
        },
        {
          id: '456',
          chargePointId: 'CP-002',
          chargePointModel: 'Wallbox',
          chargePointVendor: 'Wallbox SA',
          firmwareVersion: '2.0.0',
          status: 'OFFLINE',
          heartbeatInterval: 900,
        },
      ];

      findAllUseCase.execute.mockResolvedValue(mockChargePoints);

      const result = await controller.getAllChargePoints();

      expect(findAllUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockChargePoints);
    });

    it('should return empty array when no ChargePoints exist', async () => {
      findAllUseCase.execute.mockResolvedValue([]);

      const result = await controller.getAllChargePoints();

      expect(result).toEqual([]);
    });
  });

  describe('getChargePointById', () => {
    it('should call SelectChargePoint.execute with chargePointId', async () => {
      const chargePointId = 'CP-001';
      const mockChargePoint: Partial<ChargePoint> = {
        id: '123',
        chargePointId,
        chargePointModel: 'Model X',
        chargePointVendor: 'Tesla',
        firmwareVersion: '1.0.0',
        status: 'OFFLINE',
        heartbeatInterval: 900,
      };

      selectUseCase.execute.mockResolvedValue(mockChargePoint);

      const result = await controller.getChargePointById(chargePointId);

      expect(selectUseCase.execute).toHaveBeenCalledWith(chargePointId);
      expect(result).toEqual(mockChargePoint);
    });
  });

  describe('createChargePoint', () => {
    it('should call CreateChargePoint.execute with body', async () => {
      const input: CreateChargePointInput = {
        chargePointId: 'CP-002',
        chargePointModel: 'Model S',
        chargePointVendor: 'Tesla',
        firmwareVersion: '2.0.0',
      };

      const mockChargePoint: Partial<ChargePoint> = {
        id: '456',
        chargePointId: input.chargePointId,
        chargePointModel: input.chargePointModel,
        chargePointVendor: input.chargePointVendor,
        firmwareVersion: input.firmwareVersion,
        status: 'OFFLINE',
        heartbeatInterval: 900,
      };

      createUseCase.execute.mockResolvedValue(mockChargePoint);

      const result = await controller.createChargePoint(input);

      expect(createUseCase.execute).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockChargePoint);
    });

    it('should translate validation errors to BadRequestException', async () => {
      const input: CreateChargePointInput = {
        chargePointId: '',
        chargePointModel: 'X',
        chargePointVendor: 'Y',
        firmwareVersion: '1.0.0',
      };

      createUseCase.execute.mockRejectedValue(
        new Error('Field "chargePointId" must not be empty'),
      );

      await expect(controller.createChargePoint(input)).rejects.toThrow(
        'Field "chargePointId" must not be empty',
      );
    });
  });
});
