import { Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Response } from "express"
import { LocalAuthGuard } from "./local.strategy";

@Controller('api/v1/auth')
export class AuthControllers {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req, @Res() res: Response) {
    console.log(req)
    return res.status(200).json(await this.authService.login(req.user))
  }
}