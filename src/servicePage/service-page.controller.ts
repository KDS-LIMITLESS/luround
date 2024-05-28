import { Body, Controller, Delete, Get, HttpStatus, Post, Put, Query, Req, Res } from "@nestjs/common";
import { Request, Response, query } from "express";
import { ServicePageManager } from "./services-page.service.js";
import {  ServiceDto, ServicePageDto, ServiceTypeDTO } from "./servicePage.dto.js";
import { SkipAuth } from "../auth/jwt.strategy.js";

@Controller('api/v1/services')
export class ServiceController {
  constructor(private services: ServicePageManager) {}

  @Post('/create')
  async create_service(@Req() req, @Res() res: Response, @Body() body: ServicePageDto) {
    return res
    .status(HttpStatus.CREATED)
    .json(await this.services.add_new_service(req.user, body)) 
  }

  @Put('/edit')
  async update_service(@Req() req, @Query() query: ServiceDto, @Res() res: Response, @Body() serviceData:ServiceDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.services.edit_service(req.user, serviceData, query.serviceId)) 
  }

  @Put('/suspend-user-service')
  async suspend_user_service(@Req() req, @Query() query, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.services.suspend_service(req.user.userId, query.service_id)) 
  }

  @Delete('/delete')
  async delete_service(@Req() req, @Query() query: ServiceDto, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.services.delete_service(req.user.userId, query.serviceId)) 
  }

  @Get('/get-services')
  async get_user_service(@Req() req, @Res() res: Response, @Query() query: ServiceTypeDTO) {
    return res
    .status(HttpStatus.OK)
    .json(await this.services.get_user_services(req.user.userId, query.service_type)) 
  }

  @Get('/get-services-by-id')
  async get_user_service_by_id(@Req() req, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.services.get_user_services_(req.user.userId)) 
  }
  
  @SkipAuth()
  @Get('/get-user-services')
  async get_service(@Query() query, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.services.getService(query.url, query.service_type)) 
  }
}