import { Module } from "@nestjs/common";
import { BookingsController } from "./bookService.controller";
import { BookingsManager } from "./bookService.sevices";
import { DatabaseService } from "src/store/db.service";
import { ServicePageManager } from "src/servicePage/services-page.service";

@Module({
  imports: [],
  controllers: [BookingsController],
  providers: [BookingsManager, DatabaseService, ServicePageManager]
})

export class BookingsModule {}