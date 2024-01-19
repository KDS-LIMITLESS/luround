import { Body, Controller, Res, Req, HttpStatus, Post, Query, Get, Delete, Put } from "@nestjs/common";
import { ReceiptService } from "./receipt.services.js";
import { ReceiptDto, ReceiptPartialDTO } from "./receiptDto.js";


@Controller('api/v1/receipt')
export class ReceiptControllers {
  constructor(private receiptService: ReceiptService) {}

  @Post('generate-receipt')
  async generateReceipt(@Req() req, @Res() res, @Body() payload: ReceiptDto) {
    return res.status(HttpStatus.OK).json(await this.receiptService.generate_receipt(req.user, payload))
  }

  @Post('save-receipt')
  async saveReceipt(@Req() req, @Res() res, @Body() payload: ReceiptDto) {
    return res.status(HttpStatus.OK).json(await this.receiptService.generate_receipt(req.user, payload))
  }

  @Get('resend-receipt')
  async resendReceipts(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.receiptService.update_receipt_status(req.query.receiptId))
  }

  @Get('receipts')
  async getReceipts(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.receiptService.get_receipts(req.user.userId))
  }

  @Get('saved-receipts')
  async getSavedReceipts(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.receiptService.get_saved_receipts(req.user.userId))
  }

  @Delete('delete-receipt')
  async deleteReceipt(@Req() req, @Res() res, @Query() query) {
    return res.status(HttpStatus.OK).json(await this.receiptService.delete_receipt(query.receiptId))
  }
}