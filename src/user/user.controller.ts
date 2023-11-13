import { Body, Controller, FileTypeValidator, Get, HttpStatus, 
  ParseFilePipe, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors 
} from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadImage } from 'src/utils/cloudinary-upload.services';
import { UserDto } from './user.dto';
import { SkipAuth } from 'src/auth/jwt.strategy';
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
  @UseGuards(AuthGuard('google'))
  @Get('/google/signIn')
  async googleLogin(@Res() res: Response, @Req() req: any) {
    return res.status(HttpStatus.OK).json(await this.userService.googleSignIn(req.user)) 
  }

  @SkipAuth()
  @Post('/api/v1/sign-up')
  async localSignUp(@Res() res: Response, @Body() body: UserDto) {
    let createUser = await this.userService.localSignUp(body)
    if (!createUser === false) {
      return res.status(HttpStatus.CREATED).json(createUser)
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR)
  }

  @SkipAuth()
  @Put('/api/v1/send-reset-password-otp')
  async sendResetPasswordOtp(@Res() res: Response, @Body() body) {
    return res.status(HttpStatus.OK).json(await this.userService.send_reset_password_otp(body.email))
  }

  @SkipAuth()
  @Put('/api/v1/reset-password')
  async ResetPassword(@Res() res: Response, @Body() body) {
    return res.status(HttpStatus.OK).json(await this.userService.reset_password(body.email, body.new_password, body.otp))
  }

  @Post('/api/v1/upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(
    @UploadedFile( 
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({maxSize: 100000}),
          new FileTypeValidator({fileType: 'image/jpeg'})
        ]
      })
    )
    file: Express.Multer.File,
    @Res() res: Response
  ){
    try {
      let uploadFile = await uploadImage(file.buffer)
      return res.status(HttpStatus.CREATED).json(uploadFile)

    } catch (err: any){
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err.message)
    }
  }

}