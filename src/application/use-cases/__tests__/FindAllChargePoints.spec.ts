import { FindAllChargePoints } from '../FindAllChargePoints';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { ChargePoint } from '../../../domain/entities/ChargePoint.entity';

describe('FindAllChargePoints Use-Case', () => {
  let useCase: FindAllChargePoints;
  let repositoryMock: { findAll: jest.Mock };

  beforeEach(() => {
    repositoryMock = {
      findAll: jest.fn(),
    };

    useCase = new FindAllChargePoints(repositoryMock as unknown as IChargePointRepository);
  });

  it('should return all ChargePoints from repository', async () => {
    const mockChargePoints: Partial<ChargePoint>[] = [
      {
        id: '1',
        chargePointId: 'CP-001',
        chargePointModel: 'Tesla Supercharger',
        chargePointVendor: 'Tesla Inc',
        firmwareVersion: '1.0.0',
        status: 'OFFLINE',
        heartbeatInterval: 900,
      },
      {
        id: '2',
        chargePointId: 'CP-002',
        chargePointModel: 'Wallbox',
        chargePointVendor: 'Wallbox SA',
        firmwareVersion: '2.0.0',
        status: 'OFFLINE',
        heartbeatInterval: 900,
      },
    ];

    repositoryMock.findAll.mockResolvedValue(mockChargePoints as ChargePoint[]);

    const result = await useCase.execute();

    expect(repositoryMock.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockChargePoints);
  });

  it('should return empty array when no ChargePoints exist', async () => {
    repositoryMock.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
