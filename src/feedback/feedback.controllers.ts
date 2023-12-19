import { Body, Controller, Get, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { FeedBackService } from "./feedback.services.js";
import { FeedBackDto } from "./feedbackDto.js";


@Controller('api/v1/feedbacks')
export class FeedBackController {

  constructor (private feedbackService: FeedBackService) {}

  @Get('get')
  async getFeedBacks(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.feedbackService.get_feedBacks())
  }

  @Post('add') 
  async addFeedback(@Req() req, @Res() res, @Body() payload: FeedBackDto) {
    return res.status(HttpStatus.OK).json(await this.feedbackService.record_feedback(req.user, payload))
  }
}