import { Body, Controller, Get, HttpStatus, Post, Query, Req, Res } from "@nestjs/common";
import { QuotesService } from "./quote.services.js";

@Controller('api/v1/quotes')
export class QuoteControllers {

  constructor(private quoteService: QuotesService) {}

  @Post('send-quote')
  async sendQuote(@Req() req, @Res() res, @Body() payload, @Query() query) {
    return res.status(HttpStatus.OK).json(await this.quoteService.send_quote(req.user, query.service_id, payload))
  }

  @Get('sent-quotes')
  async getSentQuotes(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.quoteService.get_sent_quotes(req.user.userId))
  }

  @Get('received-quotes')
  async getReceivedQuotes(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.quoteService.get_received_quotes(req.user.userId))
  }
}