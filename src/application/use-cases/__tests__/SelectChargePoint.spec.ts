import { SelectChargePoint } from '../SelectChargePoint';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { ChargePoint } from '../../../domain/entities/ChargePoint.entity';

/**
 * Unit tests for SelectChargePoint use-case.
 *
 * SOLID: DIP - tests mock the IChargePointRepository interface.
 * No database, no TypeORM → pure logic testing.
 */
describe('SelectChargePoint', () => {
  let useCase: SelectChargePoint;
  let mockRepository: jest.Mocked<IChargePointRepository>;

  beforeEach(() => {
    // Mock the repository interface
    mockRepository = {
      findById: jest.fn(),
      findByChargePointId: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    useCase = new SelectChargePoint(mockRepository);
  });

  describe('execute', () => {
    it('should return a ChargePoint when found by chargePointId', async () => {
      // Arrange
      const chargePointId = 'CP-001';
      const mockChargePoint: ChargePoint = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        chargePointId,
        chargePointModel: 'Wallbox',
        chargePointVendor: 'Tesla',
        firmwareVersion: '1.0.0',
        iccid: null,
        imsi: null,
        status: 'OFFLINE',
        heartbeatInterval: 900,
        webSocketUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByChargePointId.mockResolvedValue(mockChargePoint);

      // Act
      const result = await useCase.execute(chargePointId);

      // Assert
      expect(result).toEqual(mockChargePoint);
      expect(mockRepository.findByChargePointId).toHaveBeenCalledWith(
        chargePointId,
      );
      expect(mockRepository.findByChargePointId).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when ChargePoint not found', async () => {
      // Arrange
      const chargePointId = 'CP-NONEXISTENT';
      mockRepository.findByChargePointId.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(chargePointId)).rejects.toThrow(
        `ChargePoint with chargePointId="${chargePointId}" not found`,
      );
      expect(mockRepository.findByChargePointId).toHaveBeenCalledWith(
        chargePointId,
      );
    });

    it('should throw an error when chargePointId is empty', async () => {
      // Act & Assert
      await expect(useCase.execute('')).rejects.toThrow(
        'chargePointId must not be empty',
      );
      expect(mockRepository.findByChargePointId).not.toHaveBeenCalled();
    });

    it('should throw an error when chargePointId is whitespace only', async () => {
      // Act & Assert
      await expect(useCase.execute('   ')).rejects.toThrow(
        'chargePointId must not be empty',
      );
      expect(mockRepository.findByChargePointId).not.toHaveBeenCalled();
    });
  });
});
