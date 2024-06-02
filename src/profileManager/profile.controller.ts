import { Body, Controller, Delete, Get, HttpStatus, Post, Put, Query, Req, Res,} from "@nestjs/common";
import { ProfileService } from "./profile.service.js";
import { Response } from "express";
import { userProfileDto } from "./profile.dto.js";
import { SkipAuth } from "../auth/jwt.strategy.js";

@Controller('api/v1/profile')
export class ProfileController {
  
  constructor(private profileSevice: ProfileService) {}

  @Put('/certificates/update')
  async updateCertificates(@Req() req, @Res() res: Response, @Body() body: userProfileDto ) {
    return res
    .status(HttpStatus.CREATED)
    .json(await this.profileSevice.update_user_certificates(req.user, body.certificates)) 
  }

  @Put('/media-links/update')
  async updateMediaLinks(@Req() req, @Res() res: Response, @Body() body: userProfileDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.update_user_media_links(req.user, body.media_links)) 
  }

  @Put('/about/update')
  async updateUserAbout(@Req() req, @Res() res: Response, @Body() body: userProfileDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.update_user_about(req.user, body.about)) 
  }
  
  @Put('/personal-details/update')
  async updateUserPersonalDetails(@Req() req,  @Res() res: Response, @Body() body: userProfileDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.update_user_personal_details(req.user, body)) 
  }
  
  @Put('/photo/update')
  async updateUserPhotoUrl(@Req() req, @Res() res: Response, @Body() body: userProfileDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.update_user_profile_photo(req.user, body.photoUrl)) 
  }

  @Put('/generate-custom-url')
  async generateCustomUserUrl(@Req() req, @Res() res: Response, @Body() body: userProfileDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.generate_custom_user_url(req.user, body.slug))
  }
  
  // @SkipAuth()
  @Get('/get')
  async getUserProfile(@Query() query: userProfileDto , @Res() res: Response) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.get_user_profile(query)) 
  }
  
  @Get('/certificates/get')
  async getUserCertficates(@Req() req , @Res() res: Response ) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.get_user_certs(req.user.userId)) 
  }

  // @Get('/about/get')
  // async getUserAbout(@Req() req,  @Res() res: Response) {
  //   console.log(req.user)
  //   return res
  //   .status(HttpStatus.OK)
  //   .json(await this.profileSevice.get_user_about(req.user)) 
  // }

  @SkipAuth()
  @Get('/get-user-profile-link')
  async findUserByLink(@Res() res: Response, @Query() query: userProfileDto) {
    return res
    .status(HttpStatus.OK)
    .json(await this.profileSevice.get_user_profile_by_link(query.url))
  }
  
  // @Get('/get/occupation')
  // async getUserOccupation( @Req() req, @Res() res: Response) {
  //   return res
  //   .status(HttpStatus.OK)
  //   .json(await this.profileSevice.get_user_occupation(req.user))
  // }

  // @Get('/get/media_links')
  // async generateUserMediaLinks( @Req() req, @Res() res: Response) {
  //   return res
  //   .status(HttpStatus.OK)
  //   .json(await this.profileSevice.get_user_media_links(req.user))
  // }

  /**   DEPRECIATED */
  // @Put('/generate-url')
  // async generateUserUrl( @Req() req, @Res() res: Response) {
  //   return res
  //   .status(HttpStatus.OK)
  //   .json(await this.profileSevice.generate_user_url(req.user))
  // }

  @Delete('/delete-user-link')
  async deleteUserLink(@Req() req, @Res() res: Response, @Body() payload: userProfileDto ) {
    return res.status(HttpStatus.OK).json(await this.profileSevice.deleteElementFromArray(req.user, "media_links", payload))
  }

  @Delete('/delete-user-certificate')
  async deleteUserCertificate(@Req() req, @Res() res: Response, @Body() payload: userProfileDto ) {
    return res.status(HttpStatus.OK).json(await this.profileSevice.deleteElementFromArray(req.user, "certificates", payload))
  }
}