import { Controller, Get, HttpStatus, Post, Put, Req, Res } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { Request, Response } from "express";
import { IRequest } from "src/user/interface/user.interface";

@Controller('api/v1/users/profile')
export class ProfileController {
  constructor(private profileSevice: ProfileService) {}

  @Put('/certificates/update')
  async updateCertificates(@Req() req: Request, @Res() res: Response) {
    return res
    .status(HttpStatus.CREATED)
    .json(await this.profileSevice.update_user_certificates(req.body)) 
  }

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

  @Put('/generate-custom-url')
  async generateCustomUserUrl(@Req() req: Request, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.generate_custom_user_url(req.body))
  }

  @Get('/get')
  async getUserProfile(@Req() req: IRequest, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.getUserProfile(req.query.email)) 
  }

  @Get('/get-link')
  async generateUserLink(@Req() req: Request, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.get_user_link(req.query))
  }

  @Get('/generate-url')
  async generateUserUrl(@Req() req: Request, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.generate_user_url(req.query))
  }
}