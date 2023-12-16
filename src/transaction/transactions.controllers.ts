import { Controller, Get, HttpStatus, Req, Res } from "@nestjs/common";
import { TransactionsManger } from "./tansactions.service.js";

@Controller('api/v1/transactions')
export class TransactionsController {

  constructor(private transactionService: TransactionsManger) {}

  @Get('get')
  async getUserTransactions(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(this.transactionService.get_user_transactions(req.user.userId))
  }
}