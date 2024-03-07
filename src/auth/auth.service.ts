import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt'
import ResponseMessages from "../messageConstants.js";
import { DatabaseService } from "../store/db.service.js";


@Injectable()
export class AuthService {

  _udb = this.databaseManager.userDB
  constructor( 
    private databaseManager: DatabaseService,
    private jwt: JwtService,
  ) {}

  async login(user: any): Promise<object> {    
    let payload = { email: user.email, userId: user._id, displayName: user.displayName, photoUrl: user.photoUrl, user_nToken: user.user_nToken, account_status: user.account_status }
    await this.databaseManager.updateDocument(this._udb, user._id, {user_nToken: payload.user_nToken || ""})
    let check_user_account_payment_satus = await this.calculate_user_payment_end_date(user._id)
    return { "accessToken": await this.jwt.signAsync(payload), account_status: check_user_account_payment_satus }
  }

  // validate user details before logging in
   async validateUser(email: string, psw: string) {
    const isUser = await this.databaseManager.read(this._udb, email)  
    if ( isUser === null || !await this.comparePasswords(psw, isUser.password) ){
      throw new UnauthorizedException({
        statusCode: 401,
        message: ResponseMessages.BadLoginDetails
      })
    }
    const {password, ...userDetails} = isUser
    return userDetails
  }

  async calculate_user_payment_end_date(userId: any) {
    const current_date = new Date()
    let user = await this.databaseManager.findOneDocument(this._udb, "_id", userId)
    
    if (user !== null && user.account_status === "TRIAL") {
      const expiry_date = new Date(`${user.trial_expiry}`)
      if (current_date.getTime() >= expiry_date.getTime()) {
        await this.databaseManager.updateDocument(this._udb, userId, {account_status: "INACTIVE"})
        delete user.trial_expiry
        console.log(user.account_status)
        return user.account_status;
      }
      // TRIAL NOT EXPIRED YET
      return user.account_status
    } else if (user !== null && user.payment_details !== undefined) {
      const expiry_date = new Date(`${user.payment_details.expiry_date}`)
      if (current_date.getTime() >= expiry_date.getTime()) {
        await this.databaseManager.updateDocument(this._udb, userId, {account_status: "INACTIVE"})
        return user.payment_details;
      }
      // PAYMENT NOT EXPIRED YET
      return user.account_status
    } else {
      return "You are an old user"
    }
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12)
  }

  async comparePasswords(plainPassword: string, passwordHash:string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, passwordHash)
  }
}