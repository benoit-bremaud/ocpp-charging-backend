import { ExtractJwt, Strategy } from 'passport-jwt';

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'ocpp-secret-key-change-in-prod',
    });
  }

  async validate(payload: Record<string, unknown>) {
    return {
      userId: payload.sub,
      chargePointId: payload.chargePointId,
      email: payload.email,
    };
  }
}
