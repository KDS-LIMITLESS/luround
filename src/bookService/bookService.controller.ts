import { Controller, Get, Post, Query, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { BookingsManager } from "./bookService.sevices";

@Controller('api/v1/services')
export class BookingsController {
  constructor(private bookingsManager: BookingsManager) {}

  @Post('/book')
  async bookSevice(@Req() req, @Res() res: Response) {
    return res.status(200).json(await this.bookingsManager.book_service(req.body, req.body.service_id))
  }

  @Get('/get/booking')
  async getBokingDetails(@Query() query, @Res() res: Response) {
    return res.status(200).json(await this.bookingsManager.get_booked_service_detail(query.booking_id))
  }

  @Get('/get/bookings')
  async getAllBokingDetails(@Req() req, @Res() res: Response) {
    return res.status(200).json(await this.bookingsManager.get_user_service_bookings(req.user.userId))
  }
}