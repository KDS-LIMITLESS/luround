import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller.js";
import { AdminService } from "./admin.service.js";
import { BookingsManager } from "../bookService/bookService.sevices.js";
import { DatabaseService } from "../store/db.service.js";
import { TransactionsManger } from "../transaction/tansactions.service.js";
import { PaymentsAPI } from "../payments/paystack.sevices.js";
import { UserService } from "../user/user.service.js";
import { CRMService } from "../crm/crm.service.js";
import { InsightService } from "../insights/insights.service.js";
import { ServicePageManager } from "../servicePage/services-page.service.js";
import { WalletService } from "../wallet/wallet.services.js";
import { AuthService } from "../auth/auth.service.js";
import { ProfileService } from "../profileManager/profile.service.js";

@Module({
  controllers: [AdminController],
  providers: [AdminService, BookingsManager, DatabaseService, ServicePageManager,
    TransactionsManger, PaymentsAPI, UserService, CRMService, InsightService, WalletService,
    AuthService, ProfileService
  ]
})

export class AdminModule {}