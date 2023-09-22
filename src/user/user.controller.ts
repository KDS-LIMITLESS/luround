import { Controller, FileTypeValidator, Get, HttpStatus, 
  MaxFileSizeValidator, ParseFilePipe, Post, Req, Res, 
  UploadedFile, UseGuards, UseInterceptors 
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { IRequest } from './interface/user.interface';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Login route
  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {}

  @Post('google/sign-in')
  // @UseGuards(AuthGuard('google'))
  async googleLogin(@Req() req: IRequest, @Res() res: Response) {
    return res
    .status(HttpStatus.CREATED)
    .json(await this.userService.googleSignIn(req.body)) 
  }

  @Post('/local/sign-up')
  async localSignUp(@Req() req: IRequest, @Res() res: Response) {
    let createUser = await this.userService.localSignUp(req.body)
    if (!createUser === false) {
      return res.status(HttpStatus.CREATED).json(createUser)
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR)
  }

  @Post('/local/login')
  async login(@Req() req: IRequest, @Res() res: Response) {
    let userLoginDetails = await this.userService.login(req.body)
    return res.status(HttpStatus.CREATED).json(userLoginDetails)
  }

  @Post('/upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(
    @UploadedFile( 
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({maxSize: 2000})
          new FileTypeValidator({fileType: 'image/jpeg'})
        ]
      })
    )
    file: Express.Multer.File,
    @Res() res: Response
  ) {
    return res.status(HttpStatus.CREATED).json(file.originalname)
  }
  
 
}