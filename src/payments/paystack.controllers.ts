import { Controller, Get, Param, Post, Query, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { PaystackAPI } from "src/payments/paystack.sevices";

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
}