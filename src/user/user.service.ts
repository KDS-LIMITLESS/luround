import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/store/db.service';
import { AuthService } from 'src/auth/auth.service';
import { sendOnboardingMail } from 'src/utils/mail.services';
import ResponseMessages from 'src/messageConstants';
import { createUserDto, loginUserDto } from './user.dto';


@Injectable()
export class UserService {
  _udb = this.userManager.userDB
  constructor( 
    private authService: AuthService, 
    private userManager: DatabaseService,
    private jwt: JwtService
  ) {}

  async googleSignIn(user: createUserDto): Promise<string> {
    
    if (await this.userManager.read(this._udb, user.email)) {
      return this.jwt.sign({email: user.email, picture: user.photoUrl})
    }
    await this.userManager.create(this._udb, user)
    await sendOnboardingMail(user.email, user.displayName)
    return this.jwt.sign({email: user.email, picture: user.photoUrl})
  }

  async localSignUp(user: createUserDto): Promise<object | string>{
    try {
      // CHECK IF EMAIL ALREADY EXISTS
      const isUser = await this.userManager.read(this._udb, user.email)
      if (isUser) throw Error(ResponseMessages.EmailExists)

      // HASH USERS PASSWORD
      const PSW_HASH = await this.authService.hashPassword(user.password)
      user.password = PSW_HASH
      const newuser = (await this.userManager.create(this._udb, user)).acknowledged

      // SEND ONBOARDING EMAIL
      await sendOnboardingMail(user.email, user.displayName)
      return newuser ? {email: user.email, picture: user.photoUrl, created: true} : Error(ResponseMessages.UserNotCreated)

    } catch(err: any) {
      throw new BadRequestException({
        stausCode: 400,
        message: err.message
      })
    }
  }

  async localLogin(user: loginUserDto): Promise<string> {
    // CHECK IF USER EMAIL EXISTS IN DB
    const isUser = await this.userManager.read(this._udb, user.email)  
    
    // AN ERROR OCCURED PLAIN PASSWORD AND HASH DOES NOT MATCH
    if (isUser === null || 
        !await this.authService.comparePasswords(user.password, isUser.password)
      ){
      throw new BadRequestException({
        statusCode: 400,
        message: ResponseMessages.BadLoginDetails
      })
    }
    // SUCCESS! GENERATE A USER TOKEN 
    return this.jwt.sign({email: isUser.email, picture: isUser.photoUrl})
  }

  async deleteUserAccount() {}
}