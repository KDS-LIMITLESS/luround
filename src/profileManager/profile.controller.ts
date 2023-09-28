import { Controller, Get, HttpStatus, Post, Put, Req, Res } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { Request, Response } from "express";
import { IRequest } from "src/user/interface/user.interface";

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
    .json(await this.profileSevice.update_user_certificates(req.body)) 
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
    .status(HttpStatus.OK)
    .json(await this.profileSevice.update_user_media_links(req.body)) 
  }

  @Put('/about/update')
  async updateUserDescription(@Req() req: Request, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.update_user_description(req.body)) 
  }

  @Put('/names/update')
  async updateUserNames(@Req() req: Request, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.update_user_name(req.body)) 
  }

  @Put('/occupation/update')
  async updateUserOccupation(@Req() req: Request, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.update_user_occupation(req.body)) 
  }

  /**
   * Get user profile
   * @param req 
   * @param res 
   * @returns 
   */
  @Get('/get')
  async getUserProfile(@Req() req: IRequest, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.getUserProfile(req.query.email)) 
  }
}