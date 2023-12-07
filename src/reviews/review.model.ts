import { Module } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import { ReviewService } from "./review.services.js";
import { ReviewsController } from "./review.controllers.js";

@Module({
  controllers: [ReviewsController],
  providers: [DatabaseService, ReviewService],
})

export class ReviewsModule {}
