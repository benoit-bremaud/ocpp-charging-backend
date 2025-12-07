import { SelectChargePoint } from '../SelectChargePoint';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { ChargePoint } from '../../../domain/entities/ChargePoint.entity';

describe('SelectChargePoint Use-Case', () => {
  let useCase: SelectChargePoint;
  let repositoryMock: { findByChargePointId: jest.Mock };

  beforeEach(() => {
    repositoryMock = {
      findByChargePointId: jest.fn(),
    };

    useCase = new SelectChargePoint(repositoryMock as unknown as IChargePointRepository);
  });

  it('should return a ChargePoint when found by chargePointId', async () => {
    const chargePointId = 'CP-001';
    const mockChargePoint: Partial<ChargePoint> = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      chargePointId,
      chargePointModel: 'Tesla Supercharger',
      chargePointVendor: 'Tesla Inc',
      firmwareVersion: '1.0.0',
      status: 'OFFLINE',
      heartbeatInterval: 900,
    };

    repositoryMock.findByChargePointId.mockResolvedValue(mockChargePoint);

    const result = await useCase.execute(chargePointId);

    expect(repositoryMock.findByChargePointId).toHaveBeenCalledWith(chargePointId);
    expect(result).toEqual(mockChargePoint);
  });

  it('should throw if chargePointId is empty', async () => {
    await expect(useCase.execute('   ')).rejects.toThrow('chargePointId must not be empty');
  });

  it('should throw if ChargePoint not found', async () => {
    repositoryMock.findByChargePointId.mockResolvedValue(null);

    await expect(useCase.execute('CP-NONEXISTENT')).rejects.toThrow('not found');
  });
});
