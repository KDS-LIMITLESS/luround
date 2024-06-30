import { Body, Controller, Res, Req, HttpStatus, Post, Query, Get, Delete, Put } from "@nestjs/common";
import { InvoiceService } from "./invoice.services.js";
import { InvoiceDto, InvoicePaymentDto } from "./invooiceDto.js";
import { SkipAuth } from "../auth/jwt.strategy.js";

@Controller('api/v1/invoice')
export class InvoiceControllers {
  constructor(private invoiceService: InvoiceService) {}

  @Post('generate-invoice')
  async sendInvoice(@Req() req, @Res() res, @Body() payload: InvoiceDto, @Query() query) {
    return res.status(HttpStatus.OK).json(await this.invoiceService.generate_invoice(req.user, payload))
  }

  @Put('add-invoice-payment-detail')
  async invoicePaymentDetails(@Req() req, @Res() res, @Body() payload: InvoicePaymentDto, @Query() query) {
    return res.status(HttpStatus.OK).json(await this.invoiceService.enter_invoice_payment(query.invoiceId, payload))
  }

  @Get('paid-invoices')
  async getPaidInvoices(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.invoiceService.get_paid_invoices(req.user.userId))
  }

  @SkipAuth()
  @Get('invoices')
  async getPaidInvoice(@Req() req, @Res() res, @Query() query) {
    return res.status(HttpStatus.OK).json(await this.invoiceService.get_invoice_with_reference(query.reference))
  }

  @Get('unpaid-invoices')
  async getUnPaidInvoices(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.invoiceService.get_unpaid_invoices(req.user.userId))
  }

  @Delete('delete-invoice')
  async deleteQuote(@Req() req, @Res() res, @Query() query) {
    return res.status(HttpStatus.OK).json(await this.invoiceService.delete_quote(query.invoice_id))
  }
}