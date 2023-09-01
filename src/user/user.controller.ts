import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('google')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Login route
  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {}

  @Get('signIn')
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Req() req: Request) {
    return this.userService.googleSignIn(req)
  }
}