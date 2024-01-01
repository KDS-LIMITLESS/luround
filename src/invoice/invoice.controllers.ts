import { Body, Controller, Res, Req, HttpStatus, Post, Query, Get } from "@nestjs/common";
import { InvoiceService } from "./invoice.services.js";

@Controller('api/v1/invoice')
export class InvoiceControllers {
  constructor(private invoiceService: InvoiceService) {}

  @Post('generate-invoice')
  async sendQuote(@Req() req, @Res() res, @Body() payload, @Query() query) {
    return res.status(HttpStatus.OK).json(await this.invoiceService.generate_invoice(req.user, payload, query.service_id))
  }

  @Get('paid-invoices')
  async getPaidInvoices(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.invoiceService.get_paid_invoices(req.user.userId))
  }

  @Get('unpaid-invoices')
  async getUnPaidInvoices(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.invoiceService.get_unpaid_invoices(req.user.userId))
  }
}