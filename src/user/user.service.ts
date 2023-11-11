import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/store/db.service';
import { AuthService } from 'src/auth/auth.service';
import { sendOnboardingMail } from 'src/utils/mail.services';
import ResponseMessages from 'src/messageConstants';
import { UserDto } from './user.dto';


@Injectable()
export class UserService {
  _udb = this.userManager.userDB
  constructor( 
    private authService: AuthService, 
    private userManager: DatabaseService,
    private jwt: JwtService
  ) {}

  async googleSignIn(user: any): Promise<Object> {
    let userExists = await this.userManager.read(this._udb, user.email)
    if (userExists) {
      return this.authService.login(userExists)
    }
    console.log("signing up user....")
    return this.googleSignUp(user)
  }

  async googleSignUp(user: any): Promise<Object> {
    
    if (await this.userManager.read(this._udb, user.email)) {
      throw new BadRequestException({message: ResponseMessages.EmailExists})
    }
    // Trnsform user details
    let new_user = {
      email: user.email, 
      displayName: user.firstName + " " + user.lastName, 
      photoUrl: user.picture, 
      accountCreatedFrom: "GOOGLE",
      occupation: null,
      about: null,
      certificates: null,
      media_links: null
    }
    await this.userManager.create(this._udb, new_user)
    await sendOnboardingMail(user.email, user.firstName)
    // let payload = { email: user.email, picture: user.photoUrl }
    return ResponseMessages.USER_CREATED
  }

  async localSignUp(user: UserDto): Promise<object | string>{
    try {
      // CHECK IF EMAIL ALREADY EXISTS
      const isUser = await this.userManager.read(this._udb, user.email)
      if (isUser) throw Error(ResponseMessages.EmailExists)

      // HASH USERS PASSWORD
      const PSW_HASH = await this.authService.hashPassword(user.password)
      user.password = PSW_HASH
      const newuser = (await this.userManager.create(this._udb, user)).acknowledged

      // SEND ONBOARDING EMAIL
      await sendOnboardingMail(user.email, user.firstName)
      return newuser ? {email: user.email, picture: user.photoUrl, created: true} : Error(ResponseMessages.UserNotCreated)

    } catch(err: any) {
      throw new BadRequestException({
        stausCode: 400,
        message: err.message
      })
    }
  }

 

  async deleteUserAccount() {}
}