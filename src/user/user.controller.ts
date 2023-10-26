import { Body, Controller, FileTypeValidator, HttpStatus, 
  ParseFilePipe, Post, Res, UploadedFile, UseInterceptors 
} from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadImage } from 'src/utils/cloudinary-upload.services';
import { UserDto } from './user.dto';
import { SkipAuth } from 'src/auth/jwt.strategy';

@Controller('api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Login route
  // @Get()
  // @UseGuards(AuthGuard('google'))
  // async googleAuth(@Req() req: Request) {}

  @SkipAuth()
  @Post('google/sign-in')
  async googleLogin(@Res() res: Response, @Body() body: UserDto) {
    return res
    .status(HttpStatus.CREATED)
    .json(await this.userService.googleSignIn(body)) 
  }

  @SkipAuth()
  @Post('/sign-up')
  async localSignUp(@Res() res: Response, @Body() body: UserDto) {
    let createUser = await this.userService.localSignUp(body)
    if (!createUser === false) {
      return res.status(HttpStatus.CREATED).json(createUser)
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR)
  }

  @Post('/upload-image')
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