import { Controller, Get, HttpStatus, Post, Put, Req, Res } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { Request, Response } from "express";

@Controller('api/v1/users/profile')
export class ProfileController {
  constructor(private profileSevice: ProfileService) {}

  /**
   * Update user cetificates in profile
   * @param req 
   * @param res 
   * @returns 
   */
  @Put('/certificates/update')
  async updateCertificates(@Req() req: Request, @Res() res: Response) {
    return res
    .status(HttpStatus.CREATED)
    .json(await this.profileSevice.updateUserCertificatesOrMlinks(req.body)) 
  }

  /**
   * Update user media links in profile
   * @param req 
   * @param res 
   * @returns 
   */
  @Put('/media-links/update')
  async updateMediaLinks(@Req() req: Request, @Res() res: Response) {
    return res
    .status(HttpStatus.CREATED)
    .json(await this.profileSevice.updateUserCertificatesOrMlinks(req.body)) 
  }

  /**
   * Get user profile
   * @param req 
   * @param res 
   * @returns 
   */
  @Get('/get')
  async getUserProfile(@Req() req: Request, @Res() res: Response) {
    return res
    .status(HttpStatus.CREATED)
    .json(await this.profileSevice.getUserProfile(req.body.email)) 
  }
}