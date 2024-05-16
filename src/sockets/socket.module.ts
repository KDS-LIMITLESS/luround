import { Module } from "@nestjs/common";
import { SocketsConn } from "./sockets.controllers.js";
import { InvoiceService } from "../invoice/invoice.services.js";
import { DatabaseService } from "../store/db.service.js";
import { BookingsManager } from "../bookService/bookService.sevices.js";
import { ProfileService } from "../profileManager/profile.service.js";
import { PaymentsAPI } from "../payments/paystack.sevices.js";
import { TransactionsManger } from "../transaction/tansactions.service.js";
import { ServicePageManager } from "../servicePage/services-page.service.js";
import { UserService } from "../user/user.service.js";
import { WalletService } from "../wallet/wallet.services.js";
import { AuthService } from "../auth/auth.service.js";
import { QuotesService } from "../quotes/quote.services.js";
import { ReceiptService } from "../receipt/receipt.services.js";
import { CRMService } from "../crm/crm.service.js";


@Module({
  providers: [
    SocketsConn, InvoiceService, DatabaseService, ServicePageManager,
    BookingsManager, ProfileService, PaymentsAPI, TransactionsManger,
    UserService, WalletService, AuthService, QuotesService, ReceiptService, CRMService
  ]
})

export class SocketsModule {}