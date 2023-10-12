import { Controller, HttpStatus, Post, Put, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { ServicePageManager } from "./services-page.service";

@Controller('api/v1/services')
export class ServiceController {
  constructor(private services: ServicePageManager) {}

  @Post('/create')
  async create_service(@Req() req: Request, @Res() res: Response) {
    return res
    .status(HttpStatus.CREATED)
    .json(await this.services.add_new_service(req.body)) 
  }

  @Put('/edit')
  async update_service(@Req() req: Request, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.services.edit_service(req.body, req.query)) 
  }
}