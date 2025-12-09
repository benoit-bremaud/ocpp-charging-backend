import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from '../health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return health status with metrics', () => {
    const health = service.getHealth();

    expect(health.status).toBe('healthy');
    expect(health.version).toBe('0.1.0');
    expect(health.uptime).toBeDefined();
    expect(health.metrics).toBeDefined();
    expect(health.metrics.memory).toBeDefined();
    expect(health.services.database).toBe('connected');
    expect(health.services.websocket).toBe('active');
  });
});
