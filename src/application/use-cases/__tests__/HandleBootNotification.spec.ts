import { HandleBootNotification } from '../HandleBootNotification';
import { OcppMessage } from '../../../domain/value-objects/OcppMessage';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { ChargePoint } from '../../../domain/entities/ChargePoint.entity';

describe('HandleBootNotification Use-Case', () => {
  let useCase: HandleBootNotification;
  let repositoryMock: { findByChargePointId: jest.Mock };

  beforeEach(() => {
    repositoryMock = {
      findByChargePointId: jest.fn(),
    };

    useCase = new HandleBootNotification(
      repositoryMock as unknown as IChargePointRepository,
    );
  });

  it('should return BootNotificationResponse on success', async () => {
    const message = new OcppMessage(
      2,
      'boot-001',
      'BootNotification',
      {
        chargePointId: 'CP-001',
        chargePointModel: 'Tesla Supercharger',
        chargePointVendor: 'Tesla Inc',
      },
    );

    const mockChargePoint: Partial<ChargePoint> = {
      id: '123',
      chargePointId: 'CP-001',
    };

    repositoryMock.findByChargePointId.mockResolvedValue(mockChargePoint);

    const result = await useCase.execute(message);

    expect(result).toEqual([
      3,
      'boot-001',
      expect.objectContaining({
        status: 'Accepted',
        interval: 900,
      }),
    ]);
  });

  it('should return error if ChargePoint not found', async () => {
    const message = new OcppMessage(
      2,
      'boot-002',
      'BootNotification',
      { chargePointId: 'CP-NONEXISTENT' },
    );

    repositoryMock.findByChargePointId.mockResolvedValue(null);

    const result = await useCase.execute(message);

    expect(result).toEqual([
      4,
      'boot-002',
      'ChargePointNotFound',
      expect.any(String),
    ]);
  });

  it('should return error if chargePointId missing', async () => {
    const message = new OcppMessage(2, 'boot-003', 'BootNotification', {});

    const result = await useCase.execute(message);

    expect(result).toEqual([
      4,
      'boot-003',
      'MissingChargePointId',
      expect.any(String),
    ]);
  });
});
