import { Module } from "@nestjs/common";
import { StoreFrontController } from "./.controllers.js";
import { StoreFrontService } from "./storefront.service.js";
import { DatabaseService } from "../store/db.service.js";

@Module({
  controllers: [StoreFrontController],
  providers: [StoreFrontService, DatabaseService]
})

export class StoreFrontModule {}