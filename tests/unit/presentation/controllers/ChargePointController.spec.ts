import { Test, TestingModule } from '@nestjs/testing';
import { ChargePointController } from '@/presentation/controllers/ChargePointController';
import { SelectChargePoint } from '@/application/use-cases/SelectChargePoint';
import { CreateChargePoint } from '@/application/use-cases/CreateChargePoint';
import { FindAllChargePoints } from '@/application/use-cases/FindAllChargePoints';
import { UpdateChargePoint } from '@/application/use-cases/UpdateChargePoint';
import { DeleteChargePoint } from '@/application/use-cases/DeleteChargePoint';
import { ChargePoint } from '@/domain/entities/ChargePoint.entity';
import { CreateChargePointInput } from '@/application/dto/CreateChargePointInput';
import { UpdateChargePointInput } from '@/application/dto/UpdateChargePointInput';

describe('ChargePointController', () => {
  let controller: ChargePointController;
  let selectUseCase: { execute: jest.Mock };
  let createUseCase: { execute: jest.Mock };
  let findAllUseCase: { execute: jest.Mock };
  let updateUseCase: { execute: jest.Mock };
  let deleteUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    selectUseCase = { execute: jest.fn() };
    createUseCase = { execute: jest.fn() };
    findAllUseCase = { execute: jest.fn() };
    updateUseCase = { execute: jest.fn() };
    deleteUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChargePointController],
      providers: [
        { provide: SelectChargePoint, useValue: selectUseCase },
        { provide: CreateChargePoint, useValue: createUseCase },
        { provide: FindAllChargePoints, useValue: findAllUseCase },
        { provide: UpdateChargePoint, useValue: updateUseCase },
        { provide: DeleteChargePoint, useValue: deleteUseCase },
      ],
    }).compile();

    controller = module.get<ChargePointController>(ChargePointController);
  });

  describe('updateChargePoint', () => {
    it('should call UpdateChargePoint.execute and return updated entity', async () => {
      const chargePointId = 'CP-001';
      const input: UpdateChargePointInput = {
        chargePointModel: 'Updated Model',
      };

      const mockChargePoint: Partial<ChargePoint> = {
        id: '123',
        chargePointId,
        chargePointModel: 'Updated Model',
      };

      updateUseCase.execute.mockResolvedValue(mockChargePoint);

      const result = await controller.updateChargePoint(chargePointId, input);

      expect(updateUseCase.execute).toHaveBeenCalledWith(chargePointId, input);
      expect(result).toEqual(mockChargePoint);
    });
  });

  describe('deleteChargePoint', () => {
    it('should call DeleteChargePoint.execute', async () => {
      const id = '123';
      deleteUseCase.execute.mockResolvedValue(undefined);

      await controller.deleteChargePoint(id);

      expect(deleteUseCase.execute).toHaveBeenCalledWith(id);
    });
  });

  describe('getAllChargePoints', () => {
    it('should return list of ChargePoints', async () => {
      const mockChargePoints: Partial<ChargePoint>[] = [{ id: '1', chargePointId: 'CP-001' }];

      findAllUseCase.execute.mockResolvedValue(mockChargePoints);

      const result = await controller.getAllChargePoints();

      expect(result).toEqual(mockChargePoints);
    });
  });

  describe('getChargePointById', () => {
    it('should call SelectChargePoint.execute', async () => {
      const chargePointId = 'CP-001';
      const mockChargePoint: Partial<ChargePoint> = {
        id: '1',
        chargePointId,
      };

      selectUseCase.execute.mockResolvedValue(mockChargePoint);

      const result = await controller.getChargePointById(chargePointId);

      expect(result).toEqual(mockChargePoint);
    });
  });

  describe('createChargePoint', () => {
    it('should call CreateChargePoint.execute', async () => {
      const input: CreateChargePointInput = {
        chargePointId: 'CP-002',
        chargePointModel: 'Model S',
        chargePointVendor: 'Tesla',
        firmwareVersion: '2.0.0',
      };

      const mockChargePoint: Partial<ChargePoint> = {
        id: '2',
        chargePointId: 'CP-002',
      };

      createUseCase.execute.mockResolvedValue(mockChargePoint);

      const result = await controller.createChargePoint(input);

      expect(result).toEqual(mockChargePoint);
    });
  });
});
