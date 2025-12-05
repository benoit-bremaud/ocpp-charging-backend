import { HandleHeartbeat } from '../HandleHeartbeat';
import { OcppMessage } from '../../../domain/value-objects/OcppMessage';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { ChargePoint } from '../../../domain/entities/ChargePoint.entity';

describe('HandleHeartbeat Use-Case (OCPP 1.6 Schema)', () => {
  let useCase: HandleHeartbeat;
  let repositoryMock: { findByChargePointId: jest.Mock };

  beforeEach(() => {
    repositoryMock = {
      findByChargePointId: jest.fn(),
    };

    useCase = new HandleHeartbeat(
      repositoryMock as unknown as IChargePointRepository,
    );
  });

  it('should return HeartbeatResponse on valid heartbeat', async () => {
    const message = new OcppMessage(2, 'hb-001', 'Heartbeat', {});

    const mockChargePoint: Partial<ChargePoint> = {
      id: '123',
      chargePointId: 'CP-001',
    };

    repositoryMock.findByChargePointId.mockResolvedValue(mockChargePoint);

    const result = await useCase.execute(message);

    expect(result).toEqual([
      3,
      'hb-001',
      expect.objectContaining({
        currentTime: expect.any(String),
      }),
    ]);

    // Verify ISO 8601 format
    expect(result[2].currentTime).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    );
  });

  it('should reject heartbeat with additional properties (schema violation)', async () => {
    const message = new OcppMessage(2, 'hb-002', 'Heartbeat', {
      extraField: 'not allowed',
    });

    const result = await useCase.execute(message);

    expect(result[0]).toBe(4); // CALLERROR
    expect(result[2]).toBe('FormationViolation');
    expect(result[3]).toContain('Additional property not allowed');
  });

  it('should return error if ChargePoint not found', async () => {
    const message = new OcppMessage(2, 'hb-003', 'Heartbeat', {});

    repositoryMock.findByChargePointId.mockResolvedValue(null);

    const result = await useCase.execute(message);

    expect(result).toEqual([
      4,
      'hb-003',
      'GenericError',
      expect.any(String),
    ]);
  });

  it('should throw if message is not CALL type', async () => {
    const message = new OcppMessage(3, 'hb-004', 'Heartbeat', {});

    await expect(useCase.execute(message)).rejects.toThrow(
      'Heartbeat handler expects CALL message',
    );
  });
});
