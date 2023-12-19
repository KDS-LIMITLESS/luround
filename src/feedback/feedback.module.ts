import { Module } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import { FeedBackController } from "./feedback.controllers.js";
import { FeedBackService } from "./feedback.services.js";

@Module({
  controllers: [FeedBackController],
  providers: [DatabaseService, FeedBackService]
})

export class FeedBackModule {}