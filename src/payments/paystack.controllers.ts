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
  async verifySubscriptionPayments(@Req() req, @Query() query: any, @Res() res: Response) {
    return res.status(200).json(await this.paymentManager.verifyPayment(query.ref_id, req.user.userId))
  }

  @SkipAuth()
  @Get('verify-booking-payment')
  async verifyBookingPayments(@Req() req, @Query() query: any, @Res() res: Response) {
    return res.status(200).json(await this.paymentManager.verifyBookingPayment(query.transaction_ref))
  }

  // @Get('initialize-flw-payment')
  // async initializeFlutterwavepayments(@Req() req: Request, @Res() res: Response, @Body() body) {
  //   let response: any = await PaymentsAPI.initiate_flw_payment(req.body.amount, req.user, body.phone_number)
  //   // res.redirect(301, get_payment_link.data.link)
  //   return res.status(HttpStatus.OK).json({payment_link: response.data.link})
  // }

  // @SkipAuth()
  // @Get('verify-flw-payment')
  // async verifyFlutterwavepayments(@Req() req, @Res() res: Response, @Query() query) {
  //   return res.status(200).json(await this.paymentManager.verify_flw_payment(query))
  // }

  @Get('payment-history')
  async userPaymentHistory(@Req() req, @Res() res: Response) {
    return res.status(200).json(await this.paymentManager.get_user_payment_history(req.user.userId))
  }

  @SkipAuth()
  @Get('create-monthly-plan')
  async create_monthly_plan(@Req() req, @Res() res,) {
    return res.status(HttpStatus.OK).json(await PaymentsAPI.create_monthly_payment_plan())
  }

  @SkipAuth()
  @Get('create-yearly-plan')
  async create_yearly_plan(@Req() req, @Res() res,) {
    return res.status(HttpStatus.OK).json(await PaymentsAPI.create_yearly_payment_plan())
  }

  @Get('user-subscription')
  async get_user_subscription_plan(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.paymentManager.get_user_subscription_plan(req.user.userId))
  }
}