import { Controller, Get, HttpStatus, Post, Put, Req, Res } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { Request, Response } from "express";

@Controller('api/v1/profile')
export class ProfileController {
  constructor(private profileSevice: ProfileService) {}

  @Put('/update')
  async updateProfile(@Req() req: Request, @Res() res: Response) {
    return res
    .status(HttpStatus.CREATED)
    .json(await this.profileSevice.updateUserProfie(req.body)) 
  }

  @Get('/get')
  async getUserProfile(@Req() req: Request, @Res() res: Response) {
    return res
    .status(HttpStatus.CREATED)
    .json(await this.profileSevice.getUserProfile(req.body.email)) 
  }
}