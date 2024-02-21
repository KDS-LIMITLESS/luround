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
    .json(await this.services.add_new_service(req.user, body)) 
  }

  @Put('/edit')
  async update_service(@Req() req, @Query() query: ServiceDto, @Res() res: Response, @Body() serviceData:ServiceDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.services.edit_service(req.user, serviceData, query.serviceId)) 
  }

  @Delete('/delete')
  async delete_service(@Req() req, @Query() query: ServiceDto, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.services.delete_service(req.user.userId, query.serviceId)) 
  }

  @Get('/get-services')
  async get_user_service(@Req() req, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.services.get_user_services(req.user.userId)) 
  }

  @SkipAuth()
  @Get('/get-user-services')
  async get_service(@Query() query, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.services.getService(query.url)) 
  }
}


// SOCKET //
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { interval } from "rxjs";

@WebSocketGateway()
export class ServiceSocketsConn {
  constructor(private services: ServicePageManager) {}
  @WebSocketServer() server: Server;


  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket): void {
    console.log(client.connected)
    this.server.emit('message', data);
  }

  @SubscribeMessage('user-services')
  async get_user_services(@ConnectedSocket() client: Socket): Promise<any> {
    try {
      interval(30000).subscribe(async() => {
        let url: any = client.handshake.query.url
        let service = await this.services.getService(url)
        this.server.emit('user-services', service)
      })
    } catch(err) {
      return err.message
    }
  }
}