import { Module } from "@nestjs/common";
import { Payments } from "./paystack.controllers.js";
import { PaymentsAPI } from "../payments/paystack.sevices.js";
import { DatabaseService } from "../store/db.service.js";
import { WalletService } from "../wallet/wallet.services.js";
import { TransactionsManger } from "../transaction/tansactions.service.js";

@Module({
  imports: [],
  controllers: [Payments],
  providers: [PaymentsAPI, DatabaseService, WalletService, TransactionsManger]
})

export class PaymentsModule {}