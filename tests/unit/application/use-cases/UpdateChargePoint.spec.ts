import { UpdateChargePoint } from '@/application/use-cases/UpdateChargePoint';
import { UpdateChargePointInput } from '@/application/dto/UpdateChargePointInput';
import { IChargePointRepository } from '@/domain/repositories/IChargePointRepository';
import { ChargePoint } from '@/domain/entities/ChargePoint.entity';

describe('UpdateChargePoint Use-Case', () => {
  let useCase: UpdateChargePoint;
  let repositoryMock: { findByChargePointId: jest.Mock; update: jest.Mock };

  beforeEach(() => {
    repositoryMock = {
      findByChargePointId: jest.fn(),
      update: jest.fn(),
    };

    useCase = new UpdateChargePoint(repositoryMock as unknown as IChargePointRepository);
  });

  it('should update a ChargePoint with valid input', async () => {
    const chargePointId = 'CP-001';
    const input: UpdateChargePointInput = {
      chargePointModel: 'Updated Model',
      firmwareVersion: '2.0.0',
    };

    const existing: Partial<ChargePoint> = {
      id: '123',
      chargePointId,
      chargePointModel: 'Old Model',
      chargePointVendor: 'Tesla Inc',
      firmwareVersion: '1.0.0',
    };

    const updated: Partial<ChargePoint> = {
      ...existing,
      chargePointModel: 'Updated Model',
      firmwareVersion: '2.0.0',
    };

    repositoryMock.findByChargePointId.mockResolvedValue(existing);
    repositoryMock.update.mockResolvedValue(updated);

    const result = await useCase.execute(chargePointId, input);

    expect(repositoryMock.findByChargePointId).toHaveBeenCalledWith(chargePointId);
    expect(repositoryMock.update).toHaveBeenCalledWith(
      '123',
      expect.objectContaining({
        chargePointModel: 'Updated Model',
        firmwareVersion: '2.0.0',
      }),
    );
    expect(result).toEqual(updated);
  });

  it('should throw if chargePointId not found', async () => {
    repositoryMock.findByChargePointId.mockResolvedValue(null);

    await expect(useCase.execute('CP-NONEXISTENT', { chargePointModel: 'X' })).rejects.toThrow(
      'not found',
    );
  });
});
