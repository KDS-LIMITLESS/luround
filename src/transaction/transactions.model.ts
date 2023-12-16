import { Module } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import { TransactionsManger } from "./tansactions.service.js";
import { TransactionsController } from "./transactions.controllers.js";

@Module({
  controllers: [TransactionsController],
  providers: [DatabaseService, TransactionsManger]
})

export class TransactionsModule {}