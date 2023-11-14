import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard, PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import ResponseMessages from "../messageConstants.js";
import { AuthService } from "./auth.service.js";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password'
    });
  }

  async validate(email: string, password: string) {
    let validateUser = await this.authService.validateUser(email, password)
    if (!validateUser) throw new UnauthorizedException(ResponseMessages.BadLoginDetails)
    return validateUser
  } 
}

export class LocalAuthGuard extends AuthGuard('local') {}