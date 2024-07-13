import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../store/db.service.js';
import { AuthService } from '../auth/auth.service.js';
import { generateRandomSixDigitNumber, sendOTP, sendOnboardingMail } from '../utils/mail.services.js';
import ResponseMessages from '../messageConstants.js';
import { UserDto } from './user.dto.js';
import * as bcrypt from 'bcrypt'
import { ProfileService } from '../profileManager/profile.service.js';
import { SkipAuth } from '../auth/jwt.strategy.js';


@Injectable()
export class UserService {
  _udb = this.databaseManager.userDB
  constructor( 
    private authService: AuthService, 
    private databaseManager: DatabaseService,
    private profileService: ProfileService,
    private jwt: JwtService
  ) {}
  
  @SkipAuth()
  async googleSignIn(user: any): Promise<Object> {
    let userExists = await this.databaseManager.read(this._udb, user.email)
    if (userExists) {
      return this.authService.login(userExists, user.user_nToken || "no token passed")
    }
    throw new NotFoundException({message: "User not found. Please sign up to continue"})
    // console.log("signing up user....")
    // if (user.email === null && user.displayName === null) {
    //   throw new BadRequestException({message: "User data cannot be null"})
    // }
    // return this.googleSignUp(user)
  }

  @SkipAuth()
  async googleSignUp(user: any): Promise<Object> {

     // CHECK IF EMAIL ALREADY EXISTS
     const isUser = await this.databaseManager.read(this._udb, user.email)
     if (isUser) throw new BadRequestException({message: ResponseMessages.EmailExists})

    // Trnsform user details
    const date = new Date()
    let new_user = {
      email: user.email, 
      displayName: user.firstName + " " + user.lastName, 
      photoUrl: user.photoUrl, 
      accountCreatedFrom: "GOOGLE",
      occupation: '',
      about: '',
      certificates: [],
      media_links: [],
      logo_url: '',
      company: '',
      user_nToken: user.user_nToken,
      created_at: date.toISOString(),
      account_status: "TRIAL",
      sent_expiry_email: false,
      trial_expiry: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000)
    }
    await sendOnboardingMail(user.email, user.firstName).catch(() => {
      throw new BadRequestException({message: "Invalid Email Address"})
    })
    let userId = (await this.databaseManager.create(this._udb, new_user)).insertedId
    await this.profileService.generate_user_url(user)
    return this.authService.login({ email: user.email, displayName: new_user.displayName, _id: userId, photoUrl: user.photoUrl, account_status: new_user.account_status }, user.user_nToken || "no token passed")
  }

  @SkipAuth()
  async localSignUp(user: UserDto): Promise<object | string>{
    try {
      // CHECK IF EMAIL ALREADY EXISTS
      const isUser = await this.databaseManager.read(this._udb, user.email)
      if (isUser) throw Error(ResponseMessages.EmailExists)

      
      // HASH USERS PASSWORD
      const date = new Date()
      const PSW_HASH = await this.authService.hashPassword(user.password)
      
      let new_user = {
        email: user.email, 
        displayName: user.firstName + " " + user.lastName, 
        photoUrl: user.photoUrl, 
        password: PSW_HASH,
        accountCreatedFrom: "LOCAL",
        occupation: '',
        about: '',
        logo_url: '',
        company: '',
        certificates: [],
        media_links: [],
        user_nToken: user.user_nToken,
        created_at: date,
        account_status: "TRIAL",
        sent_expiry_email: false,
        trial_expiry: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000)
      }
      await sendOnboardingMail(user.email, user.firstName).catch((err) => {
        console.log(err)
        throw Error("Invalid Email Address")
      })
      const userId = (await this.databaseManager.create(this._udb, new_user)).insertedId
      await this.profileService.generate_user_url(user)
      return this.authService.login({email: user.email, displayName: new_user.displayName, _id: userId, photoUrl: user.photoUrl, account_status: new_user.account_status},  user.user_nToken || "no token passed")

    } catch(err: any) {
      throw new BadRequestException({
        stausCode: 400,
        message: err.message
      })
    }
  }

  // async send_update_email() {
  //   let users = await this._udb.find({}).toArray()
  //   users.forEach(async (prop) => {
  //     // console.log(prop.email, prop.displayName.split(' ')[0])
  //     await sendServiceUpdateEmail(prop.email, prop.displayName.split(' ')[0])
  //     console.log('Done')
  //   })
  // }

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
  
  async get_user_notification_token(userId: string) {
    let user = await this.databaseManager.findOneDocument(this._udb, "_id", userId)
    return user.user_nToken
  }

  async deleteUserAccount(userId: string) {
    await this.databaseManager.delete(this._udb, userId)
    await this.updateTotalRevenue(0, 1)
    return "User account deleted"
  }

  // async deleteUserAccountTest(user_email: string) {
  //   await this._udb.findOneAndDelete({'email': user_email})
  //   await this.updateTotalRevenue(0, 1)
  //   return "User account deleted"
  // }

  async updateLastLoginDate(userId: string) {
    let date = Date.now()
    return await this.databaseManager.updateDocument(this._udb, userId, {updated_at: date})
  }

  async updateTotalRevenue(new_revenue: number, deleted_users: number) {
    let bossAccount = await this.databaseManager.findOneDocument(this._udb, "email", "ccachukwu@gmail.com")
    if (bossAccount.total_revenue) {
      let total_revenue = bossAccount.total_revenue + new_revenue
      let total_user_deleted = bossAccount.deleted_users + deleted_users
      return await this.databaseManager.updateDocument(this._udb, bossAccount._id, {total_revenue, deleted_users: total_user_deleted})
    }
    await this.databaseManager.updateDocument(this._udb, bossAccount._id, {total_revenue: new_revenue, deleted_users: deleted_users})
  }

  async getTotalRevenue() {
    let revenue = await this.databaseManager.findOneDocument(this._udb, "email", "ccachukwu@gmail.com")
    return { total_revenue: revenue.total_revenue, deleted_users: revenue.deleted_users }
  }
}