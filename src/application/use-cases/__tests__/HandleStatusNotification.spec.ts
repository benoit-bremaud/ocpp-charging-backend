import { HandleStatusNotification } from '../HandleStatusNotification';
import { OcppMessage } from '../../../domain/value-objects/OcppMessage';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { ChargePoint } from '../../../domain/entities/ChargePoint.entity';

describe('HandleStatusNotification Use-Case', () => {
  let useCase: HandleStatusNotification;
  let repositoryMock: { findByChargePointId: jest.Mock };

  beforeEach(() => {
    repositoryMock = {
      findByChargePointId: jest.fn(),
    };

    useCase = new HandleStatusNotification(
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

  it('should return empty response on valid StatusNotification', async () => {
    const message = new OcppMessage(
      2,
      'status-001',
      'StatusNotification',
      {
        connectorId: 1,
        errorCode: 'NoError',
        status: 'Available',
        timestamp: '2025-12-05T16:33:00Z',
      },
    );

    const mockChargePoint: Partial<ChargePoint> = {
      id: '123',
      chargePointId: 'CP-001',
    };

    repositoryMock.findByChargePointId.mockResolvedValue(mockChargePoint);

    const result = await useCase.execute(message, 'CP-001');

    expect(result).toEqual([3, 'status-001', {}]);
  });

  it('should handle "Occupied" status', async () => {
    const message = new OcppMessage(
      2,
      'status-002',
      'StatusNotification',
      {
        connectorId: 1,
        errorCode: 'NoError',
        status: 'Occupied',
        timestamp: '2025-12-05T16:33:00Z',
      },
    );

    const mockChargePoint: Partial<ChargePoint> = {
      id: '123',
      chargePointId: 'CP-001',
    };

    repositoryMock.findByChargePointId.mockResolvedValue(mockChargePoint);

    const result = await useCase.execute(message, 'CP-001');

    expect(result).toEqual([3, 'status-002', {}]);
  });

  it('should reject missing required fields', async () => {
    const message = new OcppMessage(
      2,
      'status-003',
      'StatusNotification',
      {
        connectorId: 1,
        // Missing errorCode, status, timestamp
      },
    );

    const result = await useCase.execute(message, 'CP-001');

    expect(result[0]).toBe(4); // CALLERROR
    expect(result[2]).toBe('FormationViolation');
  });

  it('should reject invalid enum value', async () => {
    const message = new OcppMessage(
      2,
      'status-004',
      'StatusNotification',
      {
        connectorId: 1,
        errorCode: 'InvalidCode',
        status: 'Available',
        timestamp: '2025-12-05T16:33:00Z',
      },
    );

    const result = await useCase.execute(message, 'CP-001');

    expect(result[0]).toBe(4);
    expect(result[2]).toBe('FormationViolation');
  });

  it('should return error if ChargePoint not found', async () => {
    const message = new OcppMessage(
      2,
      'status-005',
      'StatusNotification',
      {
        connectorId: 1,
        errorCode: 'NoError',
        status: 'Available',
        timestamp: '2025-12-05T16:33:00Z',
      },
    );

    repositoryMock.findByChargePointId.mockResolvedValue(null);

    const result = await useCase.execute(message, 'CP-NONEXISTENT');

    expect(result).toEqual([
      4,
      'status-005',
      'GenericError',
      expect.any(String),
    ]);
  });
});
