import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/store/db.service';
import { IUser } from './interface/user.interface';
import { AuthService } from 'src/auth/auth.service';
import { sendOnboardingMail } from 'src/utils/mail.services';


@Injectable()
export class UserService {
  
  constructor( 
    private authService: AuthService, 
    private _uDB: DatabaseService,
    private jwt: JwtService
  ) {}

  async googleSignIn(user: IUser): Promise<string> {
    user = {
      email:user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
      accountCreatedFrom: 'GOOGLE'
    } // CREATE A USER DTO ON THE CONTROLLER LEVEL FOR THE USER DATA
    
    if (await this._uDB.findOneDocument(user.email)) {
      return this.jwt.sign({email: user.email, picture: user.picture})
    }
    await this._uDB.createDocument(user)
    await sendOnboardingMail(user.email, user.firstName)
    return this.jwt.sign({email: user.email, picture: user.picture})
  }

  async localSignUp(user: IUser): Promise<object | false>{
    // CHECK IF EMAIL ALREADY EXISTS
    const isUser = await this._uDB.findOneDocument(user.email)
    if (isUser) throw new BadRequestException({
      statusCode: 400,
      message: "Email already exists!"
    })
    // HASH USERS PASSWORD
    const PSW_HASH = await this.authService.hashPassword(user.password)
    user = {
      email:user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
      password: PSW_HASH,
      accountCreatedFrom: "LOCAL"
    } // CREATE A USER DTO ON THE CONTROLLER LEVEL FOR THE USER DATA
    // USER SUCCESSFULLY CREATED
    const newuser = (await this._uDB.createDocument(user)).acknowledged
    // SEND ONBOARDING EMAIL
    await sendOnboardingMail(user.email, user.firstName)
    return newuser ? {email: user.email, picture: user.picture, created: true} : false
  }

  async localLogin(user: IUser): Promise<string> {
    // CHECK IF USER EMAIL EXISTS IN DB
    const isUser = await this._uDB.findOneDocument( user.email)    

    // AN ERROR OCCURED PLAIN PASSWORD AND HASH DOES NOT MATCH
    if (isUser === null || 
        !await this.authService.comparePasswords(user.password, isUser.password)
      ){
      throw new BadRequestException({
        statusCode: 400,
        message: "Invalid login details"
      })
    }
    // SUCCESS! GENERATE A USER TOKEN 
    return this.jwt.sign({email: isUser.email, picture: isUser.picture})
  }

  async deleteUserAccount() {}
}