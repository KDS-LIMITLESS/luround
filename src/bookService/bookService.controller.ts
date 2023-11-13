import { Controller, Get, Post, Put, Query, Req, Res, Body, Delete } from "@nestjs/common";
import { Response } from "express";
import { BookingsManager } from "./bookService.sevices";
import { BookServiceDto, ServiceId, BookingId } from "./bookServiceDto";

@Controller('api/v1/booking')
export class BookingsController {
  constructor(private bookingsManager: BookingsManager) {}

  @Post('/book-service')
  async bookSevice(@Body() payload: BookServiceDto, @Res() res: Response, @Query() query: ServiceId) {
    return res.status(200).json(await this.bookingsManager.book_service(payload, query.serviceId))
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
    return res.status(200).json(await this.bookingsManager.reschedule_booking(query.bookingId, body.date, body.time))
  }

}