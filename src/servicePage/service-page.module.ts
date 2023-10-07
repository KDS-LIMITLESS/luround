import { Module } from "@nestjs/common";
import { ServiceController } from "./service-page.controller";
import { ServicePageManager } from "./services-page.service";
import { DatabaseService } from "src/store/db.service";

@Module({
  imports: [],
  controllers: [ServiceController],
  providers: [ServicePageManager, DatabaseService]
})

export class ServicePageModule {}