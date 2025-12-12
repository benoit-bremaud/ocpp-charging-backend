import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  generateToken(payload: { chargePointId: string; userId: string; email: string }) {
    return this.jwtService.sign({
      sub: payload.userId,
      chargePointId: payload.chargePointId,
      email: payload.email,
    });
  }

  validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }
}
