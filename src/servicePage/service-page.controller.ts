import { Body, Controller, Delete, Get, HttpStatus, Post, Put, Query, Req, Res } from "@nestjs/common";
import { Request, Response, query } from "express";
import { ServicePageManager } from "./services-page.service.js";
import {  ServiceDto, ServicePageDto } from "./servicePage.dto.js";
import { SkipAuth } from "../auth/jwt.strategy.js";

@Controller('api/v1/services')
export class ServiceController {
  constructor(private services: ServicePageManager) {}

  @Post('/create')
  async create_service(@Req() req, @Res() res: Response, @Body() body: ServicePageDto) {
    return res
    .status(HttpStatus.CREATED)
    .json(await this.services.add_new_service(req.user.userId, body)) 
  }

  @Put('/edit')
  async update_service(@Query() query: ServiceDto, @Res() res: Response, @Body() serviceData:ServiceDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.services.edit_service(serviceData, query.serviceId)) 
  }

  @Delete('/delete')
  async delete_service(@Query() query: ServiceDto, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.services.delete_service(query.serviceId)) 
  }

  @Get('/get-services')
  async get_user_service(@Req() req, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.services.get_user_services(req.user)) 
  }

  @SkipAuth()
  @Get('/get-service')
  async get_service(@Query() query: ServiceDto, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.services.getService(query.serviceId)) 
  }
}