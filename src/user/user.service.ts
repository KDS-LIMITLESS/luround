import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../store/db.service.js';
import { AuthService } from '../auth/auth.service.js';
import { generateRandomSixDigitNumber, sendOTP, sendOnboardingMail } from '../utils/mail.services.js';
import ResponseMessages from '../messageConstants.js';
import { UserDto } from './user.dto.js';
import * as bcrypt from 'bcrypt'


@Injectable()
export class UserService {
  _udb = this.databaseManager.userDB
  constructor( 
    private authService: AuthService, 
    private databaseManager: DatabaseService,
    private jwt: JwtService
  ) {}

  async googleSignIn(user: any): Promise<Object> {
    let userExists = await this.databaseManager.read(this._udb, user.email)
    if (userExists) {
      return this.authService.login(userExists)
    }
    console.log("signing up user....")
    if (user.email === null && user.displayName === null) {
      throw new BadRequestException({message: "User data cannot be null"})
    }
    return this.googleSignUp(user)
  }

  async googleSignUp(user: any): Promise<Object> {
    // Trnsform user details
    let new_user = {
      email: user.email, 
      displayName: user.firstName + " " + user.lastName, 
      photoUrl: user.photoUrl, 
      accountCreatedFrom: "GOOGLE",
      occupation: '',
      about: '',
      certificates: [],
      media_links: [],
      user_nToken: user.user_nToken
    }
    await sendOnboardingMail(user.email, user.firstName).catch(() => {
      throw new BadRequestException({message: "Invalid Email Address"})
    })
    let userId = (await this.databaseManager.create(this._udb, new_user)).insertedId
    return this.authService.login({ email: user.email, displayName: user.displayName, _id: userId, photoUrl: user.photoUrl, user_nToken: new_user.user_nToken })
  }

  async localSignUp(user: UserDto): Promise<object | string>{
    try {
      // CHECK IF EMAIL ALREADY EXISTS
      const isUser = await this.databaseManager.read(this._udb, user.email)
      if (isUser) throw Error(ResponseMessages.EmailExists)

      
      // HASH USERS PASSWORD
      const PSW_HASH = await this.authService.hashPassword(user.password)
      
      let new_user = {
        email: user.email, 
        displayName: user.firstName + " " + user.lastName, 
        photoUrl: user.photoUrl, 
        password: PSW_HASH,
        accountCreatedFrom: "LOCAL",
        occupation: '',
        about: '',
        certificates: [],
        media_links: [],
        user_nToken: user.user_nToken
      }
      await sendOnboardingMail(user.email, user.firstName).catch(() => {
        throw Error("Invalid Email Address")
      })
      const userId = (await this.databaseManager.create(this._udb, new_user)).insertedId
      
      return this.authService.login({email: user.email, displayName: new_user.displayName, _id: userId, photoUrl: user.photoUrl, user_nToken: new_user.user_nToken})

    } catch(err: any) {
      throw new BadRequestException({
        stausCode: 400,
        message: err.message
      })
    }
  }
  async send_reset_password_otp(email: string){
    let isUser = await this.databaseManager.read(this._udb, email)

    if (isUser) {
      let otp = await generateRandomSixDigitNumber()
      
      await sendOTP(email, otp, isUser.displayName)
      await this.databaseManager.updateDocument(this._udb, isUser._id, {otp} )
      return "Update password OTP sent to users email"
    }
    throw new BadRequestException({ message: ResponseMessages.EmailDoesNotExist})
  }

  async verify_user_password(userId:string, current_password: string) {
    const isUser:any = await this.databaseManager.findOneDocument(this._udb, '_id',  userId)
    if (isUser.password && await bcrypt.compare(current_password, isUser.password)) {
      return ResponseMessages.Success
    }
    throw new BadRequestException({message: ResponseMessages.InvalidUserPassword})
  }

  async change_password(userId: string, old_password: string, new_password: string) {
    if (await this.verify_user_password(userId, old_password)){
      const password_hash = await bcrypt.hash(new_password, 12)
      await this.databaseManager.updateProperty(this._udb, userId, "password", {"password": password_hash})
      return ResponseMessages.PasswordChangeSuccessfull
    }
    throw new BadRequestException({message: ResponseMessages.InvalidUserPassword})
  }
  
  async reset_password(email: string, new_password: string, otp: number) {
    let isUser = await this.databaseManager.read(this._udb, email)
    if (isUser && otp === isUser.otp) {
      const PSW_HASH = await this.authService.hashPassword(new_password)
      await this.databaseManager.updateProperty(this._udb, isUser._id, "password", {password: PSW_HASH} )
      // delete otp details
      return "User Password Updated"
    }
    throw new BadRequestException({ message: "Invalid OTP"})
  }
 

  async deleteUserAccount() {}
}