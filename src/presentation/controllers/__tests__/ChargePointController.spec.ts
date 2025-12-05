import { Test, TestingModule } from '@nestjs/testing';
import { ChargePointController } from '../ChargePointController';
import { SelectChargePoint } from '../../../application/use-cases/SelectChargePoint';
import { ChargePoint } from '../../../domain/entities/ChargePoint.entity';

describe('ChargePointController', () => {
  let controller: ChargePointController;
  let mockUseCase: jest.Mocked<SelectChargePoint>;

  beforeEach(async () => {
    // Mock the use-case
    mockUseCase = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChargePointController],
      providers: [
        {
          provide: SelectChargePoint,
          useValue: mockUseCase,
        },
      ],
    }).compile();

    controller = module.get<ChargePointController>(ChargePointController);
  });

  describe('getChargePointById', () => {
    it('should call SelectChargePoint.execute with chargePointId', async () => {
      const chargePointId = 'CP-001';
      const mockChargePoint: Partial<ChargePoint> = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        chargePointId: 'CP-001',
        chargePointModel: 'Tesla Supercharger',
        chargePointVendor: 'Tesla Inc',
        firmwareVersion: '1.0.0',
        status: 'OFFLINE',
        heartbeatInterval: 900,
      };

      mockUseCase.execute.mockResolvedValue(mockChargePoint as ChargePoint);

      const result = await controller.getChargePointById(chargePointId);

      expect(mockUseCase.execute).toHaveBeenCalledWith(chargePointId);
      expect(result).toEqual(mockChargePoint);
    });

    it('should propagate use-case errors (e.g., not found)', async () => {
      const chargePointId = 'NONEXISTENT';
      mockUseCase.execute.mockRejectedValue(
        new Error('ChargePoint with chargePointId="NONEXISTENT" not found'),
      );

      await expect(
        controller.getChargePointById(chargePointId),
      ).rejects.toThrow('not found');
    });
  });
});
