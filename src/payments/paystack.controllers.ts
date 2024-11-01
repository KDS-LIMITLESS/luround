import { Body, Controller, Get, HttpStatus, Param, Post, Query, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { PaymentsAPI } from "../payments/paystack.sevices.js";
import { SkipAuth } from "../auth/jwt.strategy.js";
import crypto from 'crypto'
import { WalletService } from "../wallet/wallet.services.js";
import { BookingsManager } from "../bookService/bookService.sevices.js";
import { InvoiceService } from "../invoice/invoice.services.js";
import { TransactionsManger } from "../transaction/tansactions.service.js";
import { UserService } from "../user/user.service.js";
import { StoreFrontService } from "../storefront/storefront.service.js";

@Controller('api/v1/payments')
export class Payments {

  constructor(
    private paymentManager: PaymentsAPI, 
    private walletService: WalletService, 
    public bookingService: BookingsManager, 
    private invoiceService: InvoiceService,
    private transactonsService: TransactionsManger, 
    private userService: UserService,
    private productService: StoreFrontService
  ) {}

  // @Post('initialize-payment')
  // async makepayments(@Req() req: Request, @Res() res: Response) {
  //   res.status(200).json(
  //     await PaymentsAPI.initializePayment(req.body.email, req.body.amount)
  //   )
  // }

  @Get('verify-payment')
  async verifySubscriptionPayments(@Req() req, @Query() query: any, @Res() res: Response) {
    return res.status(200).json(await this.paymentManager.verifyPayment(query.ref_id, req.user.userId))
  }

  // @SkipAuth()
  // @Get('verify-account-number')
  // async verifyAccountNumber(@Req() req, @Body() body: any, @Res() res: Response) {
  //   return res.status(200).json(await verifyAccountNumber(body.account_number, body.bank_code))
  // }

  // @SkipAuth()
  // @Get('verify-booking-payment')
  // async verifyBookingPayments(@Req() req, @Query() query: any, @Res() res: Response) {
  //   return res.status(200).json(await this.paymentManager.verifyBookingPayment(query.transaction_ref))
  // }

  @SkipAuth()
  @Post('verify-transfer')
  async transferWebhook(@Req() req, @Res() res: Response) {
    // VALIDATE EVENT IS FROM PAYSTACK
    let secret = process.env.PAYSTACK_SECRET
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
     
    if (hash === req.headers['x-paystack-signature']) {
      const eventData = req.body;

      if(eventData.event === 'transfer.success') {
        console.log("Verifying Transfer...:", eventData.data.reference )
        let amount = eventData.data.amount / 100

        if (amount <= 5000) {
          amount += 10
        } else if (amount >= 5001 && amount <= 50000) {
          amount += 25
        } else if (amount > 50000) {
          amount += 50
        }
        // record and deduct transfer data from user wallet
        await this.walletService.record_user_transfer_transaction(
          // THE USER ID IS SAVED AS THE REASON FOR THE TRANSFER
          eventData.data.reason, 
          {
            amount: amount,
            reason: `Funds transfer to user: ${eventData.data.reason}`,
            recipient_code: eventData.data.recipient.recipient_code,
            reference: eventData.data.reference,
            session: eventData.data.session
          },   
          eventData.data.transfer_code
        )
        let dt = new Date()
        await this.transactonsService.record_transaction(eventData.data.reason, {
          service_name: 'Withdrawal',
          amount: - parseFloat(`${amount}`),
          transaction_ref: eventData.data.reference,
          transaction_date: Date.now(),
          transaction_time: dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds()
        })
        console.log("Status:", "Transaction Recorded Successfully!")
      }

      // EVENT TYPE = CHARGE.SUCCESS
      if (eventData.event === 'charge.success') {
        if(eventData.data.reference.startsWith("INVOICE")){
          let invoice = await this.invoiceService.get_invoice_with_reference(eventData.data.reference)
          if (invoice !== null) {
            let data = { amount_paid: parseFloat(eventData.data.amount) / 100, tx_ref: eventData.data.reference }
            
            await this.invoiceService.enter_invoice_payment(invoice, data)
            await this.walletService.increase_wallet_balance(invoice.service_provider.userId, parseFloat(invoice.product_detail[0].total))
            // CALCULATE REVENUE GENERATED
            await this.userService.updateTotalRevenue(parseFloat(eventData.data.amount) / 100, 0)
          }

        } else if (eventData.data.reference.startsWith("PRODUCT")){
          // come back here
          await this.productService.purchaseProduct("find a way to embed produc id from frotend request", eventData.data.reason, eventData.data.reference )

          
        } else {
          let verify_booking = await this.paymentManager.verifyBookingPayment(eventData.data.reference.toString(), parseFloat(eventData.data.amount))
          await this.bookingService.confirm_booking(verify_booking.booking_id)
          // CALCULATE REVENUE GENERATED
          await this.userService.updateTotalRevenue(parseFloat(eventData.data.amount) / 100, 0)
        }
      }
      return res.sendStatus(200)
    }
    console.log("Message:", "HACKERS TRYING!!!!")
    return res.status(400).json({message: "This request is not from Paystack!"})
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
  
  @Post('create-user-bank-detail')
  async ransfer(@Req() req, @Res() res: Response, @Body() body) {
    return res.status(200).json(await this.paymentManager.createTransferRecipient(req.user.email, body.account_number, body.bank_code, body.name))
  }

  // @SkipAuth()
  // @Get('create-monthly-plan')
  // async create_monthly_plan(@Req() req, @Res() res,) {
  //   return res.status(HttpStatus.OK).json(await PaymentsAPI.create_monthly_payment_plan())
  // }

  // @SkipAuth()
  // @Get('create-yearly-plan')
  // async create_yearly_plan(@Req() req, @Res() res,) {
  //   return res.status(HttpStatus.OK).json(await PaymentsAPI.create_yearly_payment_plan())
  // }

  @Get('user-subscription')
  async get_user_subscription_plan(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.paymentManager.get_user_subscription_plan(req.user.userId))
  }
}