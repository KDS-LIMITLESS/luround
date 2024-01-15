import { Module } from "@nestjs/common";
import { CRMController } from "./crm.controllers.js";
import { CRMService } from "./crm.service.js";
import { DatabaseService } from "../store/db.service.js";

@Module({
  controllers: [CRMController],
  providers: [CRMService, DatabaseService]
})

export class CRMModule {}