import { Controller, Get, HttpStatus, Req, Res } from "@nestjs/common";
import { TransactionsManger } from "./tansactions.service.js";

@Controller('api/v1/transactions')
export class TransactionsController {

  constructor(private transactionService: TransactionsManger) {}

  @Get('get')
  async getUserTransactions(@Req() req, @Res() res) {
    let transactions = await this.transactionService.get_user_transactions(req.user.userId)
    if(transactions === null) return res.status(HttpStatus.NOT_FOUND).json({message: "User has no transactions"})
    return res.status(HttpStatus.OK).json(transactions)
  }
}