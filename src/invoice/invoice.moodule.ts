import { Module } from "@nestjs/common";
import { InvoiceControllers } from "./invoice.controllers.js";
import { InvoiceService } from "./invoice.services.js";
import { DatabaseService } from "../store/db.service.js";
import { PaymentsAPI } from "../payments/paystack.sevices.js";
import { WalletService } from "../wallet/wallet.services.js";
import { BookingsManager } from "../bookService/bookService.sevices.js";
import { ServicePageManager } from "../servicePage/services-page.service.js";
import { TransactionsManger } from "../transaction/tansactions.service.js";
import { UserService } from "../user/user.service.js";
import { AuthService } from "../auth/auth.service.js";
import { ProfileService } from "../profileManager/profile.service.js";
import { CRMService } from "../crm/crm.service.js";
import { InsightService } from "../insights/insights.service.js";

@Module({
  controllers: [InvoiceControllers],
  providers: [InvoiceService, DatabaseService, PaymentsAPI, WalletService, BookingsManager, ServicePageManager, 
    TransactionsManger, UserService, AuthService, ProfileService, CRMService, InsightService]
})

export class InvoiceModule {}