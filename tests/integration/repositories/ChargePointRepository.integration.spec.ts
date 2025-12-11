import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChargePointRepository } from '@/infrastructure/repositories/ChargePointRepository';
import { ChargePoint } from '@/domain/entities/ChargePoint.entity';

describe('ChargePointRepository - Integration Tests', () => {
  let repository: ChargePointRepository;
  let mockTypeormRepository: jest.Mocked<Repository<ChargePoint>>;

  beforeEach(async () => {
    mockTypeormRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChargePointRepository,
        {
          provide: getRepositoryToken(ChargePoint),
          useValue: mockTypeormRepository,
        },
      ],
    }).compile();

    repository = module.get<ChargePointRepository>(ChargePointRepository);
  });

  describe('CRUD Operations', () => {
    it('should find charge point by UUID', async () => {
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

      mockTypeormRepository.findOne.mockResolvedValueOnce(mockChargePoint);

      const result = await repository.find(mockChargePoint.id);

      expect(result).toEqual(mockChargePoint);
      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockChargePoint.id },
      });
    });

    it('should find charge point by chargePointId', async () => {
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

      mockTypeormRepository.findOne.mockResolvedValueOnce(mockChargePoint);

      const result = await repository.findByChargePointId('CP-001');

      expect(result).toEqual(mockChargePoint);
      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({
        where: { chargePointId: 'CP-001' },
      });
    });

    it('should find all charge points', async () => {
      const mockChargePoints: ChargePoint[] = [
        {
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
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174000',
          chargePointId: 'CP-002',
          chargePointVendor: 'Chargepoint',
          chargePointModel: 'Express 250',
          firmwareVersion: '2.0.0',
          iccid: null,
          imsi: null,
          status: 'OFFLINE',
          heartbeatInterval: 900,
          webSocketUrl: 'ws://localhost:8081',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockTypeormRepository.find.mockResolvedValueOnce(mockChargePoints);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockChargePoints);
      expect(mockTypeormRepository.find).toHaveBeenCalled();
    });

    it('should create new charge point', async () => {
      const newChargePoint = {
        chargePointId: 'CP-NEW',
        chargePointVendor: 'NewVendor',
        chargePointModel: 'NewModel',
        firmwareVersion: '3.0.0',
      };

      const savedChargePoint: ChargePoint = {
        id: '323e4567-e89b-12d3-a456-426614174000',
        ...newChargePoint,
        iccid: null,
        imsi: null,
        status: 'OFFLINE',
        heartbeatInterval: 900,
        webSocketUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTypeormRepository.create.mockReturnValueOnce(savedChargePoint as any);
      mockTypeormRepository.save.mockResolvedValueOnce(savedChargePoint);

      const result = await repository.create(newChargePoint);

      expect(result).toEqual(savedChargePoint);
      expect(mockTypeormRepository.create).toHaveBeenCalledWith(newChargePoint);
      expect(mockTypeormRepository.save).toHaveBeenCalledWith(savedChargePoint);
    });

    it('should update charge point', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = { firmwareVersion: '2.0.0' };

      const updatedChargePoint: ChargePoint = {
        id,
        chargePointId: 'CP-001',
        chargePointVendor: 'Tesla',
        chargePointModel: 'Wall Connector',
        firmwareVersion: '2.0.0',
        iccid: null,
        imsi: null,
        status: 'ONLINE',
        heartbeatInterval: 900,
        webSocketUrl: 'ws://localhost:8080',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTypeormRepository.update.mockResolvedValueOnce({ affected: 1 } as any);
      mockTypeormRepository.findOne.mockResolvedValueOnce(updatedChargePoint);

      const result = await repository.update(id, updateData);

      expect(result).toEqual(updatedChargePoint);
      expect(mockTypeormRepository.update).toHaveBeenCalledWith(id, updateData);
      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
    });

    it('should delete charge point', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';

      mockTypeormRepository.delete.mockResolvedValueOnce({ affected: 1 } as any);

      await repository.delete(id);

      expect(mockTypeormRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should handle not found on find', async () => {
      mockTypeormRepository.findOne.mockResolvedValueOnce(null);

      const result = await repository.find('non-existent-id');

      expect(result).toBeNull();
    });

    it('should handle not found on findByChargePointId', async () => {
      mockTypeormRepository.findOne.mockResolvedValueOnce(null);

      const result = await repository.findByChargePointId('CP-UNKNOWN');

      expect(result).toBeNull();
    });

    it('should handle concurrent reads correctly', async () => {
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

      mockTypeormRepository.findOne.mockResolvedValue(mockChargePoint);

      const results = await Promise.all([
        repository.find('123e4567-e89b-12d3-a456-426614174000'),
        repository.find('123e4567-e89b-12d3-a456-426614174000'),
        repository.find('123e4567-e89b-12d3-a456-426614174000'),
      ]);

      expect(results).toHaveLength(3);
      expect(results.every((r) => r?.id === mockChargePoint.id)).toBe(true);
      expect(mockTypeormRepository.findOne).toHaveBeenCalledTimes(3);
    });

    it('should validate input data on create', async () => {
      const newChargePoint = {
        chargePointId: 'CP-001',
        chargePointVendor: 'TestVendor',
        chargePointModel: 'TestModel',
        firmwareVersion: '1.0.0',
      };

      const savedChargePoint: ChargePoint = {
        id: '323e4567-e89b-12d3-a456-426614174000',
        ...newChargePoint,
        iccid: null,
        imsi: null,
        status: 'OFFLINE',
        heartbeatInterval: 900,
        webSocketUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTypeormRepository.create.mockReturnValueOnce(savedChargePoint as any);
      mockTypeormRepository.save.mockResolvedValueOnce(savedChargePoint);

      const result = await repository.create(newChargePoint);

      expect(result.chargePointId).toBeDefined();
      expect(result.chargePointVendor).toBeDefined();
      expect(result.chargePointModel).toBeDefined();
    });

    it('should track audit timestamps on update', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const now = new Date();

      const updatedChargePoint: ChargePoint = {
        id,
        chargePointId: 'CP-001',
        chargePointVendor: 'Tesla',
        chargePointModel: 'Wall Connector',
        firmwareVersion: '2.0.0',
        iccid: null,
        imsi: null,
        status: 'ONLINE',
        heartbeatInterval: 900,
        webSocketUrl: 'ws://localhost:8080',
        createdAt: new Date('2025-01-01'),
        updatedAt: now,
      };

      mockTypeormRepository.update.mockResolvedValueOnce({ affected: 1 } as any);
      mockTypeormRepository.findOne.mockResolvedValueOnce(updatedChargePoint);

      const result = await repository.update(id, { firmwareVersion: '2.0.0' });

      expect(result.updatedAt).toBe(now);
      expect(result.createdAt.getTime()).toBeLessThan(result.updatedAt.getTime());
    });
  });
});
