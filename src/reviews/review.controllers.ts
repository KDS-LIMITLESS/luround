import { Body, Controller, HttpStatus, Query, Req, Res, Post, Get } from "@nestjs/common";
import { ReviewService } from "./review.services.js";
import { ReviewDTO, ReviewPickDTO, ReviewPickServiceIdDTO } from "./review.dto.js";

@Controller('api/v1/reviews')
export class ReviewsController {

  constructor(private reviewsService: ReviewService) {}

  @Post('add-review')
  async addReviews(@Req() req, @Res() res, @Body() payload: ReviewPickDTO, @Query() query: ReviewPickServiceIdDTO) {
    return res.status(HttpStatus.OK).json(await this.reviewsService.review(req.user, query.serviceId, payload))
  }

  @Get('service-reviews')
  async getServiceReviews(@Res() res, @Query() query: ReviewPickServiceIdDTO) {
    return res.status(HttpStatus.OK).json(await this.reviewsService.get_service_reviews(query.serviceId))
  }
}