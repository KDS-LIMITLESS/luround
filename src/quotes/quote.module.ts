import { Module } from "@nestjs/common";
import { QuoteControllers } from "./quote.controllers.js";
import { QuotesService } from "./quote.services.js";
import { DatabaseService } from "../store/db.service.js";
import { ProfileService } from "../profileManager/profile.service.js";

@Module({
  controllers: [QuoteControllers],
  providers: [QuotesService, DatabaseService, ProfileService]
})

export class QuoteModule {}