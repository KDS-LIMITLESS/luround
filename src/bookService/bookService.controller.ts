import { Controller, Get, Post, Put, Query, Req, Res, Body, Delete, BadGatewayException, UnauthorizedException, InternalServerErrorException } from "@nestjs/common";
import { Response } from "express";
import { BookingsManager } from "./bookService.sevices.js";
import { BookServiceDto, ServiceId, BookingId } from "./bookServiceDto.js";
import { SkipAuth } from "../auth/jwt.strategy.js";

@Controller('api/v1/booking')
export class BookingsController {
  constructor(private bookingsManager: BookingsManager) {}

  @SkipAuth()
  @Post('/book-service')
  async bookSevice(@Req() req, @Body() payload: BookServiceDto, @Res() res: Response, @Query() query: ServiceId) {
    return res.status(200).json(await this.bookingsManager.book_service(payload, query.serviceId, req.user))
  }

  @Get('/get')
  async getBokingDetails(@Query() query: BookingId, @Res() res: Response) {
    return res.status(200).json(await this.bookingsManager.get_booked_service_detail(query.bookingId))
  }

  @Get('my-bookings')
  async getAllBokingDetails(@Req() req, @Res() res: Response) {
    return res.status(200).json(await this.bookingsManager.get_user_service_bookings(req.user.userId))
  }

  @Delete('/delete')
  async deleteBooking(@Query() query: BookingId, @Res() res: Response) {
    return res.status(200).json(await this.bookingsManager.delete_booking(query.bookingId))
  }

  @Put('/reschedule')
  async rescheduleBooking(@Query() query: BookingId, @Res() res: Response, @Body() body) {
    return res.status(200).json(await this.bookingsManager.reschedule_booking(query.bookingId, body.date, body.time, body.duration))
  }

  @Get('/cancel')
  async cancelBooking(@Query() query: BookingId, @Res() res: Response) {
    return res.status(200).json(await this.bookingsManager.cancel_booking(query.bookingId))
  }

  @Get('confirm-booking')
  async confirmBooking(@Query() query: BookingId, @Res() res: Response) {
    return res.status(200).json(await this.bookingsManager.confirm_booking(query.bookingId))
  }
}

import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { interval } from "rxjs";
import { JwtService } from "@nestjs/jwt";

@WebSocketGateway()
export class BookingSocketsConn {
  constructor(private bookingsManager: BookingsManager, private jwt: JwtService) {}
  @WebSocketServer() server: Server;


  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket): void {
    console.log(client.connected)
    this.server.emit('message', data);
  }

  @SubscribeMessage('user-bookings')
  async get_user_services(@ConnectedSocket() client: Socket): Promise<any> {
    try {
      interval(30000).subscribe(async() => {
        let header: any = client.handshake.headers.authorization
        if(header !== undefined && header.split(' ')[0] === 'Bearer') {
          let decodedToken = await this.jwt.verifyAsync(header.split(' ')[1], {secret: process.env.JWT_SECRET_KEY})
          let bookings = await this.bookingsManager.get_user_service_bookings(decodedToken.userId)
          this.server.emit('user-bookings', bookings)
        } else {
          this.server.emit('user-bookings', {status: 401, message: "Unauthorized"})
        }
      })
    } catch(err) {
      this.server.emit('user-bookings', err.message)
    }
  }
}