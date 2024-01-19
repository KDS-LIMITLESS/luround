import { Module } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import { ReceiptService } from "./receipt.services.js";
import { ReceiptControllers } from "./receipt.controllers.js";
import { ProfileService } from "../profileManager/profile.service.js";



@Module({
  controllers: [ReceiptControllers],
  providers: [DatabaseService, ReceiptService, ProfileService]
})

export class ReceiptModule {}