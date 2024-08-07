import { Body, Controller,  Get, HttpStatus, UseGuards,
  Post, Put, Req, Res, Delete, Query, // UploadedFile,ParseFilePipe , UseInterceptors, FileTypeValidator,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { Response, query } from 'express';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { uploadImage } from '../utils/cloudinary-upload.services.js';
import { GoogleUserDTO, UserDto } from './user.dto.js';
import { SkipAuth } from '../auth/jwt.strategy.js';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Login route
  @SkipAuth()
  @Get('google-auth')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {}

  @SkipAuth()
  // @UseGuards(AuthGuard('google'))
  @Post('/google/signIn')
  async googleLogin(@Res() res: Response, @Req() req: any) {
    return res.status(HttpStatus.OK).json(await this.userService.googleSignIn(req.body)) 
  }

  @SkipAuth()
  @Post('/api/v1/sign-up')
  async localSignUp(@Res() res: Response, @Body() body: UserDto) {
    let createUser = await this.userService.localSignUp(body)
    return res.status(HttpStatus.CREATED).json(createUser)
  }

  @SkipAuth()
  @Post('/api/v1/google/sign-up')
  async googleSignUp(@Res() res: Response, @Body() body: GoogleUserDTO) {
    let createUser = await this.userService.googleSignUp(body)
    return res.status(HttpStatus.CREATED).json(createUser)
  }

  @SkipAuth()
  @Put('/api/v1/send-reset-password-otp')
  async sendResetPasswordOtp(@Res() res: Response, @Body() body) {
    return res.status(HttpStatus.OK).json(await this.userService.send_reset_password_otp(body.email))
  }

  // @SkipAuth()
  // @Get('updates')
  // async sendUpdates(@Res() res: Response, @Body() body) {
  //   return res.status(HttpStatus.OK).json(await this.userService.send_update_email())
  // }

  @SkipAuth()
  @Put('/api/v1/reset-password')
  async ResetPassword(@Res() res: Response, @Body() body) {
    return res.status(HttpStatus.OK).json(await this.userService.reset_password(body.email, body.new_password, body.otp))
  }

  @Put('/api/v1/change-password')
  async changePassword(@Req() req, @Res() res: Response, @Body() body) {
    return res.status(HttpStatus.OK).json(await this.userService.change_password(req.user.userId, body.old_password, body.new_password))
  }

  @Delete('api/v1/user/account/delete')
  async deleteUserAccount(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.userService.deleteUserAccount(req.user.userId))
  }

  @SkipAuth()
  @Get('api/v1/user/account/delete')
  async deleteUserAccountTest(@Req() req, @Res() res, @Query() query) {
    return res.status(HttpStatus.OK).json(await this.userService.deleteUserAccountTest(query.user_email))
  }
  
  // @Post('/api/v1/upload-image')
  // @UseInterceptors(FileInterceptor('image'))
  // async uploadFile(
  //   @UploadedFile( 
  //     new ParseFilePipe({
  //       validators: [
  //         // new MaxFileSizeValidator({maxSize: 100000}),
  //         new FileTypeValidator({fileType: 'image/jpeg'})
  //       ]
  //     })
  //   )
  //   file: Express.Multer.File,
  //   @Res() res: Response
  // ){
  //   try {
  //     let uploadFile = await uploadImage(file.buffer)
  //     return res.status(HttpStatus.CREATED).json(uploadFile)

  //   } catch (err: any){
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err.message)
  //   }
  // }

}