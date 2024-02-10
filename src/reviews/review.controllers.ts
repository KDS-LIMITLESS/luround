import { Body, Controller, HttpStatus, Query, Req, Res, Post, Get } from "@nestjs/common";
import { ReviewService } from "./review.services.js";
import { ReviewDTO, ReviewPickDTO, ReviewPickServiceIdDTO } from "./review.dto.js";
import { SkipAuth } from "../auth/jwt.strategy.js";

@Controller('api/v1/reviews')
export class ReviewsController {

  constructor(private reviewsService: ReviewService) {}

  @SkipAuth()
  @Post('add-review')
  async addReviews( @Res() res, @Body() payload: ReviewPickDTO, @Query() query: ReviewPickServiceIdDTO) {
    return res.status(HttpStatus.OK).json(await this.reviewsService.review(query.userId, payload))
  }

  @SkipAuth()
  @Get('user-reviews')
  async getServiceReviews(@Res() res, @Query() query: ReviewPickServiceIdDTO) {
    return res.status(HttpStatus.OK).json(await this.reviewsService.get_user_reviews(query.userId))
  }
}