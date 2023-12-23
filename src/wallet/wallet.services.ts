import { BadRequestException, Injectable } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import * as bcrypt from 'bcrypt'
import ResponseMessages from "../messageConstants.js";
import { ObjectId } from "mongodb";
import { got } from "got";
import { WithdrawalFailed, WithdrawalSuccess, generateRandomSixDigitNumber, sendWalletPinResetOTP } from "../utils/mail.services.js";
import { WithdrawDTO } from "./wallet.dto.js";


@Injectable()
export class WalletService {

  _uWDB = this.databaseManger.userDB;
  _wDB = this.databaseManger.walletDB

  constructor (private databaseManger: DatabaseService) {}

  async add_bank_details(user: any, bank_details: any) {
    try {
      const { email} = user
      await this.databaseManger.updateArr(this._uWDB, 'email', email, "bank_details", [bank_details])
      return ResponseMessages.WalletDetailAdded
    } catch (err: any) {
      throw new BadRequestException({message: "An error occured" })
    }    
  }

  async get_user_saved_banks(userId: string) {
    try {
      let user = await this.databaseManger.findOneDocument(this._uWDB, "_id", userId )
      if (user === null) throw new BadRequestException(ResponseMessages.EmailDoesNotExist)
      return user.bank_details
    } catch (err: any) {
      throw new BadRequestException({message: err.message})
    }
  }

  async create_wallet(userId: string, pin: string) {
    try {
      const pin_hash = await bcrypt.hash(pin, 12)
      if (pin.length !== 4) throw new BadRequestException({message: "Pin length must be four digits."})
      await this.databaseManger.create(this._wDB, {"_id": new ObjectId(userId), 'wallet_pin': pin_hash, wallet_balance: 0, has_wallet_pin: true})
      return ResponseMessages.WalletPinCreated
    } catch(err: any) {
      throw new BadRequestException({message: err.message})
    }    
  }

  async verify_wallet_pin(userId:string, wallet_pin: string) {
    const isUser:any = await this.databaseManger.findOneDocument(this._wDB, '_id',  userId)
    if (isUser.wallet_pin && await bcrypt.compare(wallet_pin, isUser.wallet_pin)) {
      return ResponseMessages.Success
    }
    throw new BadRequestException({message: ResponseMessages.InvalidWalletPin})
  }

  async get_wallet_balance(userId: string){
    let getWallet =  await this.databaseManger.findOneDocument(this._wDB, "_id", userId)
    return getWallet ?  {wallet_balance: getWallet.wallet_balance, has_wallet_pin: getWallet.has_wallet_pin} : null
  }

  async reset_wallet_pin(userId: string, old_pin: string, new_pin: string) {
    if (await this.verify_wallet_pin(userId, old_pin) && new_pin.length === 4){
      const new_pin_hash = await bcrypt.hash(new_pin, 12)
      await this.databaseManger.updateProperty(this._wDB, userId, "wallet_pin", {"wallet_pin": new_pin_hash})
      return ResponseMessages.PinResetSuccessful
    }
    throw new BadRequestException({message: "Invalid wallet pin."})
  }

  async forgot_wallet_pin(userId: string,  new_pin: string, otp: number) {
    let document = await this.databaseManger.findOneDocument(this._wDB, "_id", userId)
    console.log(document.pin_reset_otp ,  otp)
    if (document.pin_reset_otp === otp && new_pin.length === 4) {
      const new_pin_hash = await bcrypt.hash(new_pin, 12)
      await this.databaseManger.updateProperty(this._wDB, userId, "wallet_pin", {"wallet_pin": new_pin_hash})
      return ResponseMessages.PinResetSuccessful
    }
    throw new BadRequestException({message: "Invalid Otp"})
  }

  async send_wallet_reset_pin_otp(user: any) {
    const {userId, email, displayName } = user
    if (await this.databaseManger.read(this._uWDB, email)) {
      let reset_otp = await generateRandomSixDigitNumber()
      await this.databaseManger.updateDocument(this._wDB, userId, {pin_reset_otp: reset_otp})
      await sendWalletPinResetOTP(email, reset_otp, displayName)
      return ResponseMessages.OTPSent
    }
    throw new BadRequestException({message: ResponseMessages.EmailDoesNotExist})
  }

  // transfer api
  // deduct wallet balance.
  async deduct_wallet_balance(userId: string, amount: number) {
    try {
      let { wallet_balance } = await this.get_wallet_balance(userId)
      if (wallet_balance !== null && wallet_balance > amount) {
        wallet_balance -= amount
        await this.databaseManger.updateProperty(this._wDB, userId, 'wallet_ballance', {wallet_balance})
        return ResponseMessages.TransactionSuccessful
      }
      return new BadRequestException({message: 'Wallet balance is too low for this transaction'})  
    } catch (err: any){
      throw new BadRequestException({message: 'You have not created a luround wallet.'})
    }
  }

  // increase wallet balance.
  async increase_wallet_balance(userId: string, amount: number) {
    try {
      let { wallet_balance } = await this.get_wallet_balance(userId)
      if (wallet_balance !== null && wallet_balance > amount) {
        wallet_balance += amount
        await this.databaseManger.updateProperty(this._wDB, userId, 'wallet_ballance', {wallet_balance})
        return ResponseMessages.TransactionSuccessful
      }
      return new BadRequestException({message: 'Wallet balance is too low for this transaction'})  
    } catch (err: any) {
      throw new BadRequestException({message: 'You have not created a luround wallet.'})
    }
  }
  
  // wite validations.
  async withdraw_funds(user: any, payload: WithdrawDTO) {
    const {userId, email, displayName} = user
    const { wallet_balance } = await this.get_wallet_balance(userId)
    try {
      // const { wallet_balance } = await this.get_wallet_balance(userId)
      if (wallet_balance >= payload.amount) {
        await this.verify_wallet_pin(userId, payload.wallet_pin)
        const response  = await got.post('https://api.flutterwave.com/v3/transfers', {
          headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
          },
          json: {
            account_bank: payload.account_bank,
            account_number: payload.account_number,
            amount: payload.amount,
            currency: "NGN",
            narration: "Luround Funds Withdrawal",
            debit_currency: "NGN"
          }
        }).json()
        const responseData = await response
        await this.deduct_wallet_balance(userId, payload.amount)
        await WithdrawalSuccess(email, displayName, wallet_balance, payload.amount)
        console.log(responseData)
        return responseData
      } 
      return new BadRequestException({message: 'Your wallet balance is low'})
    } catch(err: any) {
      await WithdrawalFailed(email, displayName, wallet_balance, payload.amount)
      throw new BadRequestException({message: err.message})
    }
  }
  // on successful balance withdrawal    (Transfer API), deduct wallet balance.
  // on successful payment verification (Verify Payments API) increase wallet balance.
}