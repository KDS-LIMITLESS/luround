import { Controller, Get, HttpStatus, Query, Req, Res } from "@nestjs/common";
import { InsightService } from "./insights.service.js";
import { SkipAuth } from "../auth/jwt.strategy.js";
import { Response } from "express";


@Controller("api/v1/insights")
export class InsightsController {
  constructor(private insightService: InsightService) {}

  @Get('get')
  async get_service_insights(@Res() res, @Query() query) {
    return res.status(HttpStatus.OK).json(await this.insightService.get_service_insight(query.service_id))
  }

  @SkipAuth()
  @Get('get-service-url')
  async record_service_link_clicks(@Res() res: Response, @Query() query) {
    let redirect_url = await this.insightService.record_service_link_clicks(query.url)
    return res.redirect(redirect_url)
  }
}