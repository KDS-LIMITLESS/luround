import { Body, Controller, Get, HttpStatus, Post, Put, Query, Req, Res } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { Response } from "express";
import { aboutDto, certificatesDto, customURLDto, displayNameDto, emailDto, media_linksDto, occupationDto, urlDto } from "./profile.dto";

@Controller('api/v1/users/profile')
export class ProfileController {
  constructor(private profileSevice: ProfileService) {}

  @Put('/certificates/update')
  async updateCertificates(@Res() res: Response, @Body() body: certificatesDto ) {
    return res
    .status(HttpStatus.CREATED)
    .json(await this.profileSevice.update_user_certificates(body)) 
  }

  @Put('/media-links/update')
  async updateMediaLinks(@Res() res: Response, @Body() body: media_linksDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.update_user_media_links(body)) 
  }

  @Put('/about/update')
  async updateUserAbout(@Res() res: Response, @Body() body: aboutDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.update_user_about(body)) 
  }

  @Put('/display-name/update')
  async updateUserNames(@Res() res: Response, @Body() body: displayNameDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.update_user_display_name(body)) 
  }

  @Put('/occupation/update')
  async updateUserOccupation(@Res() res: Response, @Body() body: occupationDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.update_user_occupation(body)) 
  }

  @Put('/generate-custom-url')
  async generateCustomUserUrl(@Res() res: Response, @Body() body: customURLDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.generate_custom_user_url(body))
  }

  @Get('/get')
  async getUserProfile(@Query() req: emailDto , @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.get_user_profile(req.email)) 
  }

  @Get('/certificates/get')
  async getUserCertficates(@Query() req: emailDto , @Res() res: Response ) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.get_user_certs(req.email)) 
  }

  @Get('/about/get')
  async getUserAbout(@Query() req: emailDto,  @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.get_user_about(req.email)) 
  }

  @Get('/get-user-profile-link')
  async findUserByLink(@Res() res: Response, @Query() req: urlDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.get_user_profile_by_link(req.url))
  }

  @Get('/get/occupation')
  async getUserOccupation(@Res() res: Response, @Query() req: emailDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.get_user_occupation(req.email))
  }

  @Get('/get/media_links')
  async generateUserMediaLinks(@Res() res: Response, @Query() req: emailDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.get_user_media_links(req.email))
  }

  @Get('/generate-url')
  async generateUserUrl(@Res() res: Response, @Query() req: emailDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.generate_user_url(req.email))
  }
}