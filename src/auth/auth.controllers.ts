import { Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { Response } from "express"
import { LocalAuthGuard } from "./local.strategy.js";
import { SkipAuth } from "./jwt.strategy.js";

@Controller('api/v1/auth')
export class AuthControllers {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req, @Res() res: Response) {
    return res.status(200).json(await this.authService.login(req.user))
  }
}