import { Body, Controller, Delete, Get, HttpStatus, Post, Put, Query, Req, Res } from "@nestjs/common";
import { Request, Response, query } from "express";
import { ServicePageManager } from "./services-page.service";
import { EmailDto, IdDto, ServicePageDto } from "./servicePage.dto";
import { createUserDto } from "src/user/user.dto";

@Controller('api/v1/services')
export class ServiceController {
  constructor(private services: ServicePageManager) {}

  @Post('/create')
  async create_service(@Body() req: ServicePageDto, @Res() res: Response) {
    return res
    .status(HttpStatus.CREATED)
    .json(await this.services.add_new_service(req)) 
  }

  @Put('/edit')
  async update_service(@Req() req: createUserDto, @Res() res: Response, @Query() query:ServicePageDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.services.edit_service(req, query.id)) 
  }

  @Delete('/delete')
  async delete_service(@Req() req: ServicePageDto, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.services.delete_service(req)) 
  }

  @Get('/get-services')
  async get_user_service(@Query() query: EmailDto, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.services.get_user_services(query.email)) 
  }

  @Get('/get-service')
  async get_service(@Query() query: IdDto, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.services.getService(query.id)) 
  }
}