import { Module } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import { WalletService } from "./wallet.services.js";
import { WalletController } from "./wallet.controllers.js";
import { TransactionsManger } from "../transaction/tansactions.service.js";


@Module({
  controllers: [WalletController],
  providers: [DatabaseService, WalletService, TransactionsManger],
})

export class WalletModule {}