import { Module } from "@nestjs/common";
import { QuoteControllers } from "./quote.controllers.js";
import { QuotesService } from "./quote.services.js";
import { DatabaseService } from "../store/db.service.js";

@Module({
  controllers: [QuoteControllers],
  providers: [QuotesService, DatabaseService]
})

export class QuoteModule {}