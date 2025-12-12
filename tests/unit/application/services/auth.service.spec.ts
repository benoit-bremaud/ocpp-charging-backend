import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '@/application/services/auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'mock-token'),
            verify: jest.fn(() => ({ sub: 'user123' })),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = {
        chargePointId: 'CP-001',
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token = service.generateToken(payload);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: payload.userId,
        chargePointId: payload.chargePointId,
        email: payload.email,
      });
      expect(token).toBe('mock-token');
    });
  });

  describe('validateToken', () => {
    it('should validate a token', () => {
      const result = service.validateToken('valid-token');
      expect(result).toEqual({ sub: 'user123' });
    });

    it('should return null for invalid token', () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = service.validateToken('invalid-token');
      expect(result).toBeNull();
    });
  });
});
