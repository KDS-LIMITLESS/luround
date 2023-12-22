import { Body, Controller, Get, HttpStatus, Param, Post, Query, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { PaymentsAPI } from "../payments/paystack.sevices.js";
import { SkipAuth } from "../auth/jwt.strategy.js";

@Controller('api/v1/payments')
export class Payments {
  constructor(private paymentManager: PaymentsAPI) {}

  @Post('initialize-payment')
  async makepayments(@Req() req: Request, @Res() res: Response) {
    res.status(200).json(
      await PaymentsAPI.initializePayment(req.body.email, req.body.amount)
    )
  }

  @Get('verify-payment')
  async verifyPayments(@Query() query: any, @Res() res: Response) {
    return res.status(200).json(await PaymentsAPI.verifyPayment(query.ref_id))
  }

  // @Get('initialize-flw-payment')
  // async initializeFlutterwavepayments(@Req() req: Request, @Res() res: Response, @Body() body) {
  //   let response: any = await PaymentsAPI.initiate_flw_payment(req.body.amount, req.user, body.phone_number)
  //   // res.redirect(301, get_payment_link.data.link)
  //   return res.status(HttpStatus.OK).json({payment_link: response.data.link})
  // }

  @SkipAuth()
  @Get('verify-flw-payment')
  async verifyFlutterwavepayments(@Req() req, @Res() res: Response, @Query() query) {
    return res.status(200).json(await this.paymentManager.verify_flw_payment(query))
  }
}