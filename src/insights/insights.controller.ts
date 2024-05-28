import { Controller, Get, HttpStatus, Query, Req, Res } from "@nestjs/common";
import { InsightService } from "./insights.service.js";


@Controller("api/v1/insights")
export class InsightsController {
  constructor(private insightService: InsightService) {}

  @Get('get')
  async get_service_insights(@Res() res, @Query() query) {
    return res.status(HttpStatus.OK).json(await this.insightService.get_service_insight(query.service_id))
  }
}