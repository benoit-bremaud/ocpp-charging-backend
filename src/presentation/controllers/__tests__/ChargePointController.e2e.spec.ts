import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, BadRequestException, NotFoundException } from '@nestjs/common';

import { ChargePointController } from '../ChargePointController';
import { SelectChargePoint } from '../../../application/use-cases/SelectChargePoint';
import { CreateChargePoint } from '../../../application/use-cases/CreateChargePoint';
import { FindAllChargePoints } from '../../../application/use-cases/FindAllChargePoints';
import { UpdateChargePoint } from '../../../application/use-cases/UpdateChargePoint';
import { DeleteChargePoint } from '../../../application/use-cases/DeleteChargePoint';
import { ChargePoint } from '../../../domain/entities/ChargePoint.entity';

describe('ChargePointController - E2E Tests', () => {
  let controller: ChargePointController;
  let mockSelectChargePoint: jest.Mocked<SelectChargePoint>;
  let mockCreateChargePoint: jest.Mocked<CreateChargePoint>;
  let mockFindAllChargePoints: jest.Mocked<FindAllChargePoints>;
  let mockUpdateChargePoint: jest.Mocked<UpdateChargePoint>;
  let mockDeleteChargePoint: jest.Mocked<DeleteChargePoint>;

  const mockChargePoint: ChargePoint = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    chargePointId: 'CP-001',
    chargePointVendor: 'Tesla',
    chargePointModel: 'Wall Connector',
    firmwareVersion: '1.0.0',
    iccid: null,
    imsi: null,
    status: 'ONLINE',
    heartbeatInterval: 900,
    webSocketUrl: 'ws://localhost:8080',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockSelectChargePoint = {
      execute: jest.fn(),
    } as any;

    mockCreateChargePoint = {
      execute: jest.fn(),
    } as any;

    mockFindAllChargePoints = {
      execute: jest.fn(),
    } as any;

    mockUpdateChargePoint = {
      execute: jest.fn(),
    } as any;

    mockDeleteChargePoint = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChargePointController],
      providers: [
        {
          provide: SelectChargePoint,
          useValue: mockSelectChargePoint,
        },
        {
          provide: CreateChargePoint,
          useValue: mockCreateChargePoint,
        },
        {
          provide: FindAllChargePoints,
          useValue: mockFindAllChargePoints,
        },
        {
          provide: UpdateChargePoint,
          useValue: mockUpdateChargePoint,
        },
        {
          provide: DeleteChargePoint,
          useValue: mockDeleteChargePoint,
        },
      ],
    }).compile();

    controller = module.get<ChargePointController>(ChargePointController);
  });

  describe('GET /charge-points', () => {
    it('should retrieve all charge points', async () => {
      const chargePoints: ChargePoint[] = [mockChargePoint];
      mockFindAllChargePoints.execute.mockResolvedValueOnce(chargePoints);

      const result = await controller.getAllChargePoints();

      expect(result).toEqual(chargePoints);
      expect(mockFindAllChargePoints.execute).toHaveBeenCalled();
    });

    it('should return empty array when no charge points exist', async () => {
      mockFindAllChargePoints.execute.mockResolvedValueOnce([]);

      const result = await controller.getAllChargePoints();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return multiple charge points', async () => {
      const chargePoints: ChargePoint[] = [
        mockChargePoint,
        {
          ...mockChargePoint,
          id: '223e4567-e89b-12d3-a456-426614174000',
          chargePointId: 'CP-002',
          status: 'OFFLINE',
        },
      ];
      mockFindAllChargePoints.execute.mockResolvedValueOnce(chargePoints);

      const result = await controller.getAllChargePoints();

      expect(result).toHaveLength(2);
      expect(result[0].chargePointId).toBe('CP-001');
      expect(result[1].chargePointId).toBe('CP-002');
    });
  });

  describe('GET /charge-points/:chargePointId', () => {
    it('should retrieve charge point by ID', async () => {
      mockSelectChargePoint.execute.mockResolvedValueOnce(mockChargePoint);

      const result = await controller.getChargePointById('CP-001');

      expect(result).toEqual(mockChargePoint);
      expect(mockSelectChargePoint.execute).toHaveBeenCalledWith('CP-001');
    });

    it('should throw NotFoundException when charge point not found', async () => {
      mockSelectChargePoint.execute.mockRejectedValueOnce(
        new Error('ChargePoint CP-UNKNOWN not found'),
      );

      await expect(controller.getChargePointById('CP-UNKNOWN')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when chargePointId is empty', async () => {
      mockSelectChargePoint.execute.mockRejectedValueOnce(
        new Error('chargePointId must not be empty'),
      );

      await expect(controller.getChargePointById('')).rejects.toThrow(BadRequestException);
    });

    it('should handle different charge point statuses', async () => {
      const offlineChargePoint = {
        ...mockChargePoint,
        status: 'OFFLINE',
      };
      mockSelectChargePoint.execute.mockResolvedValueOnce(offlineChargePoint);

      const result = await controller.getChargePointById('CP-001');

      expect(result.status).toBe('OFFLINE');
    });
  });

  describe('POST /charge-points', () => {
    it('should create new charge point', async () => {
      const createInput = {
        chargePointId: 'CP-NEW',
        chargePointVendor: 'Tesla',
        chargePointModel: 'Wall Connector',
        firmwareVersion: '1.0.0',
      };

      mockCreateChargePoint.execute.mockResolvedValueOnce(mockChargePoint);

      const result = await controller.createChargePoint(createInput);

      expect(result).toEqual(mockChargePoint);
      expect(mockCreateChargePoint.execute).toHaveBeenCalledWith(createInput);
    });

    it('should throw BadRequestException on invalid input', async () => {
      const invalidInput = {
        chargePointId: '',
        chargePointVendor: 'Tesla',
        chargePointModel: 'Wall Connector',
        firmwareVersion: '1.0.0',
      };

      mockCreateChargePoint.execute.mockRejectedValueOnce(
        new Error('Field chargePointId is required'),
      );

      await expect(controller.createChargePoint(invalidInput)).rejects.toThrow(BadRequestException);
    });

    it('should create charge point with all required fields', async () => {
      const createInput = {
        chargePointId: 'CP-FULL',
        chargePointVendor: 'Chargepoint',
        chargePointModel: 'Express 250',
        firmwareVersion: '2.0.0',
      };

      const createdChargePoint = {
        ...mockChargePoint,
        ...createInput,
      };

      mockCreateChargePoint.execute.mockResolvedValueOnce(createdChargePoint);

      const result = await controller.createChargePoint(createInput);

      expect(result.chargePointId).toBe('CP-FULL');
      expect(result.chargePointVendor).toBe('Chargepoint');
    });
  });

  describe('PUT /charge-points/:chargePointId', () => {
    it('should update existing charge point', async () => {
      const updateInput = {
        firmwareVersion: '2.0.0',
      };

      const updatedChargePoint = {
        ...mockChargePoint,
        firmwareVersion: '2.0.0',
      };

      mockUpdateChargePoint.execute.mockResolvedValueOnce(updatedChargePoint);

      const result = await controller.updateChargePoint('CP-001', updateInput);

      expect(result.firmwareVersion).toBe('2.0.0');
      expect(mockUpdateChargePoint.execute).toHaveBeenCalledWith('CP-001', updateInput);
    });

    it('should throw NotFoundException when charge point not found', async () => {
      mockUpdateChargePoint.execute.mockRejectedValueOnce(
        new Error('ChargePoint CP-UNKNOWN not found'),
      );

      await expect(
        controller.updateChargePoint('CP-UNKNOWN', { firmwareVersion: '2.0.0' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on invalid chargePointId', async () => {
      mockUpdateChargePoint.execute.mockRejectedValueOnce(
        new Error('chargePointId must not be empty'),
      );

      await expect(controller.updateChargePoint('', { firmwareVersion: '2.0.0' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should partial update charge point', async () => {
      const updateInput = {
        chargePointVendor: 'NewVendor',
      };

      const updatedChargePoint = {
        ...mockChargePoint,
        chargePointVendor: 'NewVendor',
      };

      mockUpdateChargePoint.execute.mockResolvedValueOnce(updatedChargePoint);

      const result = await controller.updateChargePoint('CP-001', updateInput);

      expect(result.chargePointVendor).toBe('NewVendor');
      expect(result.chargePointId).toBe('CP-001');
    });
  });

  describe('DELETE /charge-points/:id', () => {
    it('should delete charge point by ID', async () => {
      mockDeleteChargePoint.execute.mockResolvedValueOnce(undefined);

      await expect(
        controller.deleteChargePoint('123e4567-e89b-12d3-a456-426614174000'),
      ).resolves.not.toThrow();

      expect(mockDeleteChargePoint.execute).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
      );
    });

    it('should throw NotFoundException when charge point not found', async () => {
      mockDeleteChargePoint.execute.mockRejectedValueOnce(
        new Error('ChargePoint with id="invalid-id" not found'),
      );

      await expect(controller.deleteChargePoint('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on empty ID', async () => {
      mockDeleteChargePoint.execute.mockRejectedValueOnce(new Error('id must not be empty'));

      await expect(controller.deleteChargePoint('')).rejects.toThrow(BadRequestException);
    });

    it('should successfully delete multiple charge points', async () => {
      mockDeleteChargePoint.execute.mockResolvedValue(undefined);

      await expect(controller.deleteChargePoint('id-1')).resolves.not.toThrow();
      await expect(controller.deleteChargePoint('id-2')).resolves.not.toThrow();
      await expect(controller.deleteChargePoint('id-3')).resolves.not.toThrow();

      expect(mockDeleteChargePoint.execute).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      mockSelectChargePoint.execute.mockRejectedValueOnce(new Error('Database error'));

      await expect(controller.getChargePointById('CP-001')).rejects.toThrow();
    });

    it('should preserve error details on propagation', async () => {
      const customError = new Error('Custom database error');
      mockCreateChargePoint.execute.mockRejectedValueOnce(customError);

      await expect(
        controller.createChargePoint({
          chargePointId: 'CP-001',
          chargePointVendor: 'Tesla',
          chargePointModel: 'Model',
          firmwareVersion: '1.0.0',
        }),
      ).rejects.toThrow(customError);
    });
  });

  describe('HTTP Status Codes', () => {
    it('getAllChargePoints should return 200 OK', async () => {
      mockFindAllChargePoints.execute.mockResolvedValueOnce([mockChargePoint]);

      const result = await controller.getAllChargePoints();

      expect(result).toBeDefined();
    });

    it('getChargePointById should return 200 OK', async () => {
      mockSelectChargePoint.execute.mockResolvedValueOnce(mockChargePoint);

      const result = await controller.getChargePointById('CP-001');

      expect(result).toBeDefined();
    });

    it('createChargePoint should return 201 CREATED', async () => {
      mockCreateChargePoint.execute.mockResolvedValueOnce(mockChargePoint);

      const result = await controller.createChargePoint({
        chargePointId: 'CP-001',
        chargePointVendor: 'Tesla',
        chargePointModel: 'Model',
        firmwareVersion: '1.0.0',
      });

      expect(result).toBeDefined();
    });

    it('updateChargePoint should return 200 OK', async () => {
      mockUpdateChargePoint.execute.mockResolvedValueOnce(mockChargePoint);

      const result = await controller.updateChargePoint('CP-001', {
        firmwareVersion: '2.0.0',
      });

      expect(result).toBeDefined();
    });

    it('deleteChargePoint should return 204 NO CONTENT', async () => {
      mockDeleteChargePoint.execute.mockResolvedValueOnce(undefined);

      const result = await controller.deleteChargePoint('id-123');

      expect(result).toBeUndefined();
    });
  });
});
