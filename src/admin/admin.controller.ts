import { Controller, Get, HttpStatus, Req, Res } from "@nestjs/common";
import { AdminService } from "./admin.service.js";
import { SkipAuth } from "../auth/jwt.strategy.js";

@Controller("api/admin") 
export class AdminController {

  constructor(private adminService: AdminService) {}

  @SkipAuth()
  @Get('analytics')
  async get_analytics(@Res() res) {
    return res.status(HttpStatus.OK).json(await this.adminService.computeAdminAnalytics())
  }

  @SkipAuth()
  @Get('analytics2')
  async get_analytics2(@Res() res, @Req() req) {
    return res.status(HttpStatus.OK).json(await this.adminService.computeAdminAnalytics2(req.body.email))
  }
}