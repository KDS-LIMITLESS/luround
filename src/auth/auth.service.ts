import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt'
import ResponseMessages from "../messageConstants.js";
import { DatabaseService } from "../store/db.service.js";
import { sendPlanExpiringMail } from "../utils/mail.services.js";


@Injectable()
export class AuthService {

  _udb = this.databaseManager.userDB
  constructor( 
    private databaseManager: DatabaseService,
    private jwt: JwtService,
  ) {}

  async login(user: any, user_nToken?: string): Promise<object> {    
    let check_user_account_payment_satus = await this.calculate_user_payment_end_date(user._id)
    let payload = { email: user.email, userId: user._id, displayName: user.displayName, photoUrl: user.photoUrl, account_status: check_user_account_payment_satus }
    await this.databaseManager.updateDocument(this._udb, user._id, {user_nToken: user_nToken})
    return { "accessToken": await this.jwt.signAsync(payload), account_status: check_user_account_payment_satus }
  }

  // validate user details before logging in
   async validateUser(email: string, psw: string) {
    const isUser = await this.databaseManager.read(this._udb, email)  
    if ( isUser === null || !await this.comparePasswords(psw, isUser.password)){
      throw new UnauthorizedException({
        statusCode: 401,
        message: ResponseMessages.BadLoginDetails
      })
    }
    const {password, ...userDetails} = isUser
    return userDetails
  }

  async calculate_user_payment_end_date(userId: any) {
    let user = await this.databaseManager.findOneDocument(this._udb, "_id", userId)
    const current_date = new Date()
    const trial_expiry_date = new Date(`${user.trial_expiry}`)
    
    if (user !== null && user.account_status === "TRIAL") {
      // USER ACCOUNT IS SET TO TRIAL. CHECK IF TRIAL PERIOD HAS EXPIRED.
      

      if (current_date.getTime() >= trial_expiry_date.getTime()) {
        await this.databaseManager.updateDocument(this._udb, userId, {account_status: "INACTIVE"})
        delete user.trial_expiry
        delete user.sent_expiry_email
        return "INACTIVE";
      }
      // TRIAL NOT EXPIRED YET
      // CHECK IF TRIAL CLOSE TO EXPIRY DATE
      let send_expiry_mail_date = new Date(trial_expiry_date.getTime() - 25 * 24 * 60 * 60 * 1000)

      if (current_date.getTime() >= send_expiry_mail_date.getTime() && user.sent_expiry_email === false){
        await sendPlanExpiringMail(user.email, user.displayName)
        await this.databaseManager.updateDocument(this._udb, userId, {sent_expiry_email: true})
      }
      return user.account_status
      // USER MUST HAVE MADE PAYMENT ONCE BEFORE THIS CHECK RESOLVES TO TRUE
    } else if (user !== null && user.payment_details !== undefined) {
      const payment_expiry_date = new Date(`${user.payment_details.expiry_date}`)
      if (current_date.getTime() >= payment_expiry_date.getTime()) {
        await this.databaseManager.updateDocument(this._udb, userId, {account_status: "INACTIVE"})
        return  "INACTIVE"// user.payment_details;
      }
      // PAYMENT NOT EXPIRED YET
      // CHECK IF PAYMENT CLOSE TO EXPIRY DATE
      let send_payment_expiry_mail_date = new Date(user.payment_details.expiry_date.getTime() - 25 * 24 * 60 * 60 * 1000)
      if (current_date.getTime() >= send_payment_expiry_mail_date.getTime() && user.payment_details.sent_expiry_email === false){
        await sendPlanExpiringMail(user.email, user.displayName)
        await this.databaseManager.updateDocument(this._udb, userId, {[user.payment_details.sent_expiry_email]: true})
      }
      return user.account_status
    } else {
      return "INACTIVE"
    }
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12)
  }

  async comparePasswords(plainPassword: string, passwordHash:string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, passwordHash)
  }
}