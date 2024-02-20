import { Module } from "@nestjs/common";
import { ServiceController, ServiceSocketsConn } from "./service-page.controller.js";
import { ServicePageManager } from "./services-page.service.js";
import { DatabaseService } from "../store/db.service.js";

@Module({
  imports: [],
  controllers: [ServiceController],
  providers: [ServicePageManager, DatabaseService, ServiceSocketsConn]
})

export class ServicePageModule {}