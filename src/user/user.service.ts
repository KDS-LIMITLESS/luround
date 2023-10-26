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

  async googleSignIn(user: UserDto): Promise<Object> {
    
    if (await this.userManager.read(this._udb, user.email)) {
      return this.jwt.sign({email: user.email, picture: user.photoUrl})
    }
    await this.userManager.create(this._udb, user)
    await sendOnboardingMail(user.email, user.displayName)
    let payload = { email: user.email, picture: user.photoUrl }
    return { "accessToken": this.jwt.signAsync(payload) }
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
      await sendOnboardingMail(user.email, user.displayName)
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