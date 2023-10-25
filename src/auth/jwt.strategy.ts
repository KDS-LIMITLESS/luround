import { Injectable } from "@nestjs/common";
import { AuthGuard, PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt'


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY,
    });
  }

  async validate(payload: any) {
    // lookup user in db and cache user details
    return { 
      userId: payload.sub, 
      email: payload.email, 
      displayName: payload.displayName 
    }
  }
}

export class JwtAuthGuard extends AuthGuard('jwt') {}