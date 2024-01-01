import { Module } from "@nestjs/common";
import { InvoiceControllers } from "./invoice.controllers.js";
import { InvoiceService } from "./invoice.services.js";
import { DatabaseService } from "../store/db.service.js";
import { PaymentsAPI } from "../payments/paystack.sevices.js";
import { WalletService } from "../wallet/wallet.services.js";

@Module({
  controllers: [InvoiceControllers],
  providers: [InvoiceService, DatabaseService, PaymentsAPI, WalletService]
})

export class InvoiceModule {}