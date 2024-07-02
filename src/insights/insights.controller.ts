import { Body, Controller, Get, HttpStatus, Post, Query, Req, Res } from "@nestjs/common";
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

  @Post('record-service-click')
  async record_service_clicks(@Res() res, @Body() payload) {
    return res.status(HttpStatus.OK).json(await this.insightService.record_service_link_clicks(payload.service_link, payload.service_id))
  }


  // @SkipAuth()
  // @Get('get-service-url')
  // async record_service_link_clicks(@Res() res: Response, @Query() query) {
  //   let redirect_url = await this.insightService.record_service_link_clicks(query.url)
  //   return res.redirect(redirect_url)
  // }
}