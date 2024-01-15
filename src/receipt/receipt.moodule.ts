import { Module } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import { ReceiptService } from "./receipt.services.js";
import { ReceiptControllers } from "./receipt.controllers.js";



@Module({
  controllers: [ReceiptControllers],
  providers: [DatabaseService, ReceiptService]
})

export class ReceiptModule {}