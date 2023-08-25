import { Controller, Get, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private configService: ConfigService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('greet')
  hello(@Res() res:Response ): Response {
    console.log(this.configService.get<string>('PORT'))
    return res.status(201).json("hey")
  }
}
