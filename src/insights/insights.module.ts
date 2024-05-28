import { Module } from "@nestjs/common";
import { InsightsController } from "./insights.controller.js";
import { InsightService } from "./insights.service.js";
import { ServicePageManager } from "../servicePage/services-page.service.js";
import { DatabaseService } from "../store/db.service.js";

@Module({
  controllers: [InsightsController],
  providers: [InsightService, ServicePageManager, DatabaseService]
})

export class InsightsModule {}