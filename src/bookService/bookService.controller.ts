import { Controller, Get, Post, Query, Req, Res, Body } from "@nestjs/common";
import { Response } from "express";
import { BookingsManager } from "./bookService.sevices";
import { BookServiceDto, ServiceId, BookingId } from "./bookServiceDto";

@Controller('api/v1/services')
export class BookingsController {
  constructor(private bookingsManager: BookingsManager) {}

  @Post('/book')
  async bookSevice(@Body() req: BookServiceDto, @Res() res: Response, @Query() query: ServiceId) {
    return res.status(200).json(await this.bookingsManager.book_service(req, query.serviceId))
  }

  @Get('/get/booking')
  async getBokingDetails(@Query() query: BookingId, @Res() res: Response) {
    return res.status(200).json(await this.bookingsManager.get_booked_service_detail(query.bookingId))
  }

  @Get('/get/bookings')
  async getAllBokingDetails(@Req() req, @Res() res: Response) {
    return res.status(200).json(await this.bookingsManager.get_user_service_bookings(req.user.userId))
  }
}