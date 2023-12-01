import { Module } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import { WalletService } from "./wallet.services.js";
import { WalletController } from "./wallet.controllers.js";


@Module({
  controllers: [WalletController],
  providers: [DatabaseService, WalletService],
})

export class WalletModule {}