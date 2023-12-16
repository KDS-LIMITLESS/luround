import { Module } from "@nestjs/common";
import { BookingsController } from "./bookService.controller.js";
import { BookingsManager } from "./bookService.sevices.js";
import { DatabaseService } from "../store/db.service.js";
import { ServicePageManager } from "../servicePage/services-page.service.js";
import { TransactionsManger } from "../transaction/tansactions.service.js";

@Module({
  imports: [],
  controllers: [BookingsController],
  providers: [BookingsManager, DatabaseService, ServicePageManager, TransactionsManger]
})

export class BookingsModule {}