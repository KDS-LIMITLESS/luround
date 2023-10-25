import { Body, Controller, Get, HttpStatus, Post, Put, Query, Req, Res,} from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { Response } from "express";
import { userProfileDto } from "./profile.dto";
import { SkipAuth } from "src/auth/jwt.strategy";

@Controller('api/v1/profile')
export class ProfileController {
  
  constructor(private profileSevice: ProfileService) {}

  @Put('/certificates/update')
  async updateCertificates(@Req() req, @Res() res: Response, @Body() body: userProfileDto ) {
    return res
    .status(HttpStatus.CREATED)
    .json(await this.profileSevice.update_user_certificates(req.user.email, body.certificates)) 
  }

  @Put('/media-links/update')
  async updateMediaLinks(@Req() req, @Res() res: Response, @Body() body: userProfileDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.update_user_media_links(req.user.email, body.media_links)) 
  }

  @Put('/about/update')
  async updateUserAbout(@Req() req, @Res() res: Response, @Body() body: userProfileDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.update_user_about(req.user.email, body.about)) 
  }
  
  @Put('/display-name/update')
  async updateUserNames(@Req() req,  @Res() res: Response, @Body() body: userProfileDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.update_user_display_name(req.user.email, body.displayName)) 
  }
  
  @Put('/occupation/update')
  async updateUserOccupation(@Req() req, @Res() res: Response, @Body() body: userProfileDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.update_user_occupation(req.user.email, body.occupation)) 
  }

  @Put('/generate-custom-url')
  async generateCustomUserUrl(@Req() req, @Res() res: Response, @Body() body: userProfileDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.generate_custom_user_url(req.user.email, body.slug))
  }
  
  @Get('/get')
  async getUserProfile(@Req() req , @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.get_user_profile(req.user.email)) 
  }
  
  // @Get('/certificates/get')
  // async getUserCertficates(@Req() req , @Res() res: Response ) {
  //   return res
  //   .status(HttpStatus.OK)
  //   .json(await this.profileSevice.get_user_certs(req.user.email)) 
  // }

  // @Get('/about/get')
  // async getUserAbout(@Req() req,  @Res() res: Response) {
  //   console.log(req.user)
  //   return res
  //   .status(HttpStatus.OK)
  //   .json(await this.profileSevice.get_user_about(req.user.email)) 
  // }

  @SkipAuth()
  @Get('/get-user-profile-link')
  async findUserByLink(@Res() res: Response, @Query() req: userProfileDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.get_user_profile_by_link(req.url))
  }
  
  // @Get('/get/occupation')
  // async getUserOccupation( @Req() req, @Res() res: Response) {
  //   return res
  //   .status(HttpStatus.OK)
  //   .json(await this.profileSevice.get_user_occupation(req.user.email))
  // }

  // @Get('/get/media_links')
  // async generateUserMediaLinks( @Req() req, @Res() res: Response) {
  //   return res
  //   .status(HttpStatus.OK)
  //   .json(await this.profileSevice.get_user_media_links(req.user.email))
  // }
  
  @Get('/generate-url')
  async generateUserUrl( @Req() req, @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.generate_user_url(req.user.email))
  }
}