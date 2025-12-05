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

    // Mock Logger
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return BootNotificationResponse on success', async () => {
    // Per OCPP 1.6: payload has NO chargePointId (comes from WebSocket query)
    const message = new OcppMessage(
      2,
      'boot-001',
      'BootNotification',
      {
        chargePointModel: 'Tesla Supercharger',
        chargePointVendor: 'Tesla Inc',
      },
    );

    const mockChargePoint: Partial<ChargePoint> = {
      id: '123',
      chargePointId: 'CP-001',
    };

    repositoryMock.findByChargePointId.mockResolvedValue(mockChargePoint);

    const result = await useCase.execute(message, 'CP-001');

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
      {
        chargePointModel: 'Tesla',
        chargePointVendor: 'Tesla Inc',
      },
    );

    repositoryMock.findByChargePointId.mockResolvedValue(null);

    const result = await useCase.execute(message, 'CP-NONEXISTENT');

    expect(result).toEqual([
      4,
      'boot-002',
      'ChargePointNotFound',
      expect.any(String),
    ]);
  });

  it('should return error if required fields missing', async () => {
    const message = new OcppMessage(
      2,
      'boot-003',
      'BootNotification',
      {
        // Missing chargePointModel and chargePointVendor
      },
    );

    const result = await useCase.execute(message, 'CP-001');

    expect(result[0]).toBe(4); // CALLERROR
    expect(result[2]).toBe('FormationViolation');
  });
});
