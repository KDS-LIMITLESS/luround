import { Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { IRequest } from './interface/user.interface';

@Controller('api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Login route
  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {}

  @Post('sign-in')
  // @UseGuards(AuthGuard('google'))
  async googleLogin(@Req() req: IRequest, @Res() res: Response) {
    console.log(req)
    return res
    .status(HttpStatus.CREATED)
    .json(await this.userService.googleSignIn(req.body)) 
  }
}