import { DeleteChargePoint } from '../DeleteChargePoint';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { ChargePoint } from '../../../domain/entities/ChargePoint.entity';

describe('DeleteChargePoint Use-Case', () => {
  let useCase: DeleteChargePoint;
  let repositoryMock: { find: jest.Mock; delete: jest.Mock };

  beforeEach(() => {
    repositoryMock = {
      find: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new DeleteChargePoint(repositoryMock as unknown as IChargePointRepository);
  });

  it('should delete a ChargePoint with valid id', async () => {
    const id = '123';
    const mockChargePoint: Partial<ChargePoint> = {
      id,
      chargePointId: 'CP-001',
    };

    repositoryMock.find.mockResolvedValue(mockChargePoint);
    repositoryMock.delete.mockResolvedValue(undefined);

    await useCase.execute(id);

    expect(repositoryMock.find).toHaveBeenCalledWith(id);
    expect(repositoryMock.delete).toHaveBeenCalledWith(id);
  });

  it('should throw if id not found', async () => {
    repositoryMock.find.mockResolvedValue(null);

    await expect(useCase.execute('NONEXISTENT')).rejects.toThrow('not found');
  });

  it('should throw if id is empty', async () => {
    await expect(useCase.execute('   ')).rejects.toThrow('id must not be empty');
  });
});
