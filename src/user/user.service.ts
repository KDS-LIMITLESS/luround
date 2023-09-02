import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ResponseData } from 'src/logger.service';
import { DatabaseService } from 'src/store/db.service';

@Injectable()
export class UserService {
  constructor(
    private jwt: JwtService, 
    private db: DatabaseService
  ) {}

  async googleSignIn(req) {
    const user = await this.db.createDocument('user', req.user)
    return user === undefined ? ResponseData.log(
      HttpStatus.INTERNAL_SERVER_ERROR, "An error occured!"
    ) : this.jwt.sign(req.user)
  }

  // async googleLogin(req) {
  //   const isUser = await this.db.findOneDocument(req.user.email)
  //   if (req.user && isUser) {
  //     return {
  //       message: 'User information from google',
  //       user: req.user, // remove this line
  //       token: this.jwt.sign(req.user)
  //     }
  //   }
  //   return ResponseData.log(HttpStatus.NOT_FOUND, 'User not Found')   
  // }
}