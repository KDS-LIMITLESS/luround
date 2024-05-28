import { Module } from "@nestjs/common";
import { BookingsController } from "./bookService.controller.js";
import { BookingsManager } from "./bookService.sevices.js";
import { DatabaseService } from "../store/db.service.js";
import { ServicePageManager } from "../servicePage/services-page.service.js";
import { TransactionsManger } from "../transaction/tansactions.service.js";
import { PaymentsAPI } from "../payments/paystack.sevices.js";
import { WalletService } from "../wallet/wallet.services.js";
import { UserService } from "../user/user.service.js";
import { AuthService } from "../auth/auth.service.js";
import { ProfileService } from "../profileManager/profile.service.js";
import { CRMService } from "../crm/crm.service.js";
import { InsightService } from "../insights/insights.service.js";


@Module({
  imports: [],
  controllers: [BookingsController],
  providers: [
    BookingsManager, 
    DatabaseService, 
    ServicePageManager, 
    TransactionsManger,
    PaymentsAPI,
    WalletService,
    UserService,
    AuthService,
    ProfileService,
    CRMService,
    InsightService
  ]
})

export class BookingsModule {}