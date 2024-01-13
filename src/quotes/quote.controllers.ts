import { Body, Controller, Delete, Get, HttpStatus, Post, Query, Req, Res } from "@nestjs/common";
import { QuotesService } from "./quote.services.js";
import { QuotesDto,  QuotesOptionalDto,  RequestQuoteDto } from "./quotesDto.js";
import { SkipAuth } from "../auth/jwt.strategy.js";

@Controller('api/v1/quotes')
export class QuoteControllers {

  constructor(private quoteService: QuotesService) {}

  @Post('send-quote')
  async sendQuote(@Req() req, @Res() res, @Body() payload: QuotesDto) {
    return res.status(HttpStatus.OK).json(await this.quoteService.send_quote(req.user, payload))
  }

  @SkipAuth()
  @Post('request-quote')
  async requestQuote(@Res() res, @Body() payload: RequestQuoteDto, @Query() query) {
    return res.status(HttpStatus.OK).json(await this.quoteService.request_quote(payload, query.serviceId))
  }

  @Post('save-quote')
  async saveQuote(@Req() req, @Res() res, @Body() payload: QuotesOptionalDto) {
    return res.status(HttpStatus.OK).json(await this.quoteService.send_quote(req.user, payload))
  }

  @Get('sent-quotes')
  async getSentQuotes(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.quoteService.get_sent_quotes(req.user.userId))
  }

  @Get('saved-quotes')
  async getSavedQuotes(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.quoteService.get_saved_quotes(req.user.userId))
  }

  @Get('received-quotes')
  async getReceivedQuotes(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.quoteService.get_received_quotes(req.user.userId))
  }

  @Delete('delete-quote')
  async deleteQuote(@Req() req, @Res() res, @Query() query) {
    return res.status(HttpStatus.OK).json(await this.quoteService.delete_quote(query.quote_id))
  }
}