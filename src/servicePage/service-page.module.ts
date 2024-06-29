import { Module } from "@nestjs/common";
import { ServiceController } from "./service-page.controller.js";
import { ServicePageManager } from "./services-page.service.js";
import { DatabaseService } from "../store/db.service.js";
import { InsightService } from "../insights/insights.service.js";

@Module({
  imports: [],
  controllers: [ServiceController],
  providers: [ServicePageManager, DatabaseService, InsightService ]
})

export class ServicePageModule {}