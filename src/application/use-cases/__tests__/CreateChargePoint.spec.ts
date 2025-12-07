import { CreateChargePoint } from '../CreateChargePoint';
import { CreateChargePointInput } from '../../dto/CreateChargePointInput';
import { IChargePointRepository } from '../../../domain/repositories/IChargePointRepository';
import { ChargePoint } from '../../../domain/entities/ChargePoint.entity';

describe('CreateChargePoint Use-Case', () => {
  let useCase: CreateChargePoint;
  let repositoryMock: {
    create: jest.Mock;
  };

  beforeEach(() => {
    repositoryMock = {
      create: jest.fn(),
    };

    useCase = new CreateChargePoint(repositoryMock as unknown as IChargePointRepository);
  });

  const validInput: CreateChargePointInput = {
    chargePointId: 'CP-001',
    chargePointModel: 'Tesla Supercharger',
    chargePointVendor: 'Tesla Inc',
    firmwareVersion: '1.0.0',
    iccid: null,
    imsi: null,
    webSocketUrl: null,
  };

  it('should create a ChargePoint when input is valid', async () => {
    const mockChargePoint: Partial<ChargePoint> = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      chargePointId: validInput.chargePointId,
      chargePointModel: validInput.chargePointModel,
      chargePointVendor: validInput.chargePointVendor,
      firmwareVersion: validInput.firmwareVersion,
      status: 'OFFLINE',
      heartbeatInterval: 900,
    };

    repositoryMock.create.mockResolvedValue(mockChargePoint as ChargePoint);

    const result = await useCase.execute(validInput);

    expect(repositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        chargePointId: validInput.chargePointId,
        chargePointModel: validInput.chargePointModel,
        chargePointVendor: validInput.chargePointVendor,
        firmwareVersion: validInput.firmwareVersion,
      }),
    );
    expect(result).toEqual(mockChargePoint);
  });

  it('should throw if a required field is empty', async () => {
    const invalidInput: CreateChargePointInput = {
      ...validInput,
      chargePointId: '   ',
    };

    await expect(useCase.execute(invalidInput)).rejects.toThrow(
      'Field "chargePointId" must not be empty',
    );
    expect(repositoryMock.create).not.toHaveBeenCalled();
  });

  it('should throw if chargePointModel is missing', async () => {
    const invalidInput: CreateChargePointInput = {
      ...validInput,
      chargePointModel: '',
    };

    await expect(useCase.execute(invalidInput)).rejects.toThrow(
      'Field "chargePointModel" must not be empty',
    );
  });

  it('should throw if chargePointVendor is missing', async () => {
    const invalidInput: CreateChargePointInput = {
      ...validInput,
      chargePointVendor: '',
    };

    await expect(useCase.execute(invalidInput)).rejects.toThrow(
      'Field "chargePointVendor" must not be empty',
    );
  });

  it('should throw if firmwareVersion is missing', async () => {
    const invalidInput: CreateChargePointInput = {
      ...validInput,
      firmwareVersion: '',
    };

    await expect(useCase.execute(invalidInput)).rejects.toThrow(
      'Field "firmwareVersion" must not be empty',
    );
  });

  it('should allow optional fields to be null or undefined', async () => {
    const inputWithoutOptionals: CreateChargePointInput = {
      chargePointId: 'CP-002',
      chargePointModel: 'Model S',
      chargePointVendor: 'Tesla',
      firmwareVersion: '2.0.0',
    };

    const mockChargePoint: ChargePoint = {
      id: '223e4567-e89b-12d3-a456-426614174000',
      chargePointId: 'CP-002',
      chargePointModel: 'Model S',
      chargePointVendor: 'Tesla',
      firmwareVersion: '2.0.0',
      status: 'OFFLINE',
      heartbeatInterval: 900,
      iccid: null,
      imsi: null,
      webSocketUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    repositoryMock.create.mockResolvedValue(mockChargePoint);

    const result = await useCase.execute(inputWithoutOptionals);

    expect(result).toEqual(mockChargePoint);
  });
});
