import { Controller, Get, HttpStatus, Post, Req, Res, UseGuards, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { IRequest } from './interface/user.interface';

@Controller('google')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Login route
  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {}

  @Get('signIn')
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Req() req: IRequest, @Res() res: Response) {
    return res
    .status(HttpStatus.CREATED)
    .json(await this.userService.googleSignIn(req.user)) 
  }
}