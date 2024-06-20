import { Module } from "@nestjs/common";
import { Payments } from "./paystack.controllers.js";
import { PaymentsAPI } from "../payments/paystack.sevices.js";
import { DatabaseService } from "../store/db.service.js";
import { WalletService } from "../wallet/wallet.services.js";
import { TransactionsManger } from "../transaction/tansactions.service.js";
import { BookingsModule } from "../bookService/bookService.module.js";
import { BookingsManager } from "../bookService/bookService.sevices.js";
import { ServicePageManager } from "../servicePage/services-page.service.js";
import { UserService } from "../user/user.service.js";
import { CRMService } from "../crm/crm.service.js";
import { InsightService } from "../insights/insights.service.js";
import { AuthService } from "../auth/auth.service.js";
import { ProfileService } from "../profileManager/profile.service.js";

@Module({
  imports: [],
  controllers: [Payments],
  providers: [PaymentsAPI, DatabaseService, WalletService, 
    TransactionsManger,
    BookingsManager, 
    ServicePageManager,
    UserService, CRMService, InsightService, AuthService, ProfileService]
})

export class PaymentsModule {}