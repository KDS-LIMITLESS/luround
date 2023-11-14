import { Body, Controller, Get, Param, Post, Query, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { PaystackAPI } from "../payments/paystack.sevices.js";

@Controller('api/v1/payments')
export class Payments {

  @Post('initialize-payment')
  async makepayments(@Req() req: Request, @Res() res: Response) {
    res.status(200).json(
      await PaystackAPI.initializePayment(req.body.email, req.body.amount)
    )
  }

  @Get('verify-payment')
  async verifyPayments(@Query() query: any, @Res() res: Response) {
    return res.status(200).json(await PaystackAPI.verifyPayment(query.ref_id))
  }

  @Get('initialize-flw-payment')
  async initializeFlutterwavepayments(@Req() req: Request, @Res() res: Response, @Body() body) {
    let get_payment_link:any = await PaystackAPI.initiate_flw_payment(req.body.amount, req.user, body.phone_number)
    let link = get_payment_link.data.link
    console.log(get_payment_link)
    res.redirect(301, link)
  }

  @Get('verify-flw-payment')
  async verifyFlutterwavepayments(@Res() res: Response, @Query() query) {
    return res.status(200).json(await PaystackAPI.verify_flw_payment(query))
  }

}