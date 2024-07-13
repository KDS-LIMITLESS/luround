import { BadGatewayException, BadRequestException, Injectable } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import * as bcrypt from 'bcrypt'
import ResponseMessages from "../messageConstants.js";
import { ObjectId } from "mongodb";
import Flutterwave from 'flutterwave-node-v3';
import { WithdrawalFailed, WithdrawalSuccess, generateRandomSixDigitNumber, sendWalletPinResetOTP } from "../utils/mail.services.js";
import { UserWalletDto, WithdrawDTO } from "./wallet.dto.js";
import { initiateTransferToUserBank } from "../payments/paystack.sevices.js";
import { TransactionsManger } from "../transaction/tansactions.service.js";
import { Decimal } from "decimal.js";

const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY)

@Injectable()
export class WalletService {

  _uWDB = this.databaseManger.userDB;
  _wDB = this.databaseManger.walletDB

  constructor (private databaseManger: DatabaseService, private transactions: TransactionsManger) {}

  // VALIDATE THE ACCOUNT NUMBER ----->  https://api.paystack.co/bank/resolve?account_number=0001234567&bank_code=058
  // CALL THE PAYSTACK CREATE TRANSFER RECEIPIENT API HERE AND SAVE THE RECEIPIENT CODE
  // async verify_bank_details(user: any, bank_details: UserWalletDto) {
  //   try {
  //     const { email} = user
  //     let verify_user_account_number: any = await verifyAccountNumber(bank_details.account_number, bank_details.bank_code)
  //     if (verify_user_account_number.status === true){
  //       return verify_user_account_number.data
  //     }
  //     throw new BadRequestException({message: "Invalid bank details"})
      
  //   } catch (err: any) {
  //     throw new BadRequestException({message: err})
  //   }    
  // }

  async get_user_saved_banks(userId: string) {
    try {
      let user = await this.databaseManger.findOneDocument(this._uWDB, "_id", userId )
      if (user === null) throw new BadRequestException(ResponseMessages.EmailDoesNotExist)
      return user.bank_details || []
    } catch (err: any) {
      throw new BadRequestException({message: err.message})
    }
  }

  async delete_bank_detail(userId: string, obj: UserWalletDto) {
    let delElem = await this.databaseManger.deletefromArray(this._uWDB, userId, "bank_details", obj ) 
    if (delElem.modifiedCount === 1) return "Item Deleted"
    throw new BadRequestException({message: "Item not found in array."})
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
    try {
      if (isUser.wallet_pin && await bcrypt.compare(wallet_pin, isUser.wallet_pin)) {
        return ResponseMessages.Success
      }
      throw new BadRequestException({message: ResponseMessages.InvalidWalletPin})
    } catch(err:any) {
      throw new BadGatewayException({message: err.message})
    }
    
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
    try {
      let document = await this.databaseManger.findOneDocument(this._wDB, "_id", userId)
      if (document.pin_reset_otp === otp && new_pin.length === 4) {
        const new_pin_hash = await bcrypt.hash(new_pin, 12)
        await this.databaseManger.updateProperty(this._wDB, userId, "wallet_pin", {"wallet_pin": new_pin_hash})
        return ResponseMessages.PinResetSuccessful
      }
      throw new BadRequestException({message: "Invalid Otp"})
    } catch (err: any) {
      throw new BadGatewayException({message: "pin_reset_otp not generated"})
    }
    
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
  async deduct_wallet_balance(userId: string, amount: any) {
    try {
      let { wallet_balance } = await this.get_wallet_balance(userId)

      if (wallet_balance !== null && wallet_balance >= amount) {

        // FIX PRESCION FLOATING 
        wallet_balance = new Decimal(wallet_balance)
        amount = new Decimal(amount)
        wallet_balance.minus(amount)
        await this.databaseManger.updateProperty(this._wDB, userId, 'wallet_ballance', { wallet_balance: Number(wallet_balance.toPrecision(3)) })

        return ResponseMessages.TransactionSuccessful
      }
      throw new BadRequestException({message: 'Wallet balance is too low for this transaction'})  
    } catch (err: any){
      console.log(err)
      throw new BadRequestException({message: err.message})
    }
  }

  // increase wallet balance.
  async increase_wallet_balance(userId: string, amount: any) {
    try {
      let balance  = await this.get_wallet_balance(userId)
      if ( balance === null ) {
        // USER HAS NO WALLET
        await this.create_wallet(userId, '0000')
        amount = new Decimal(amount)
        await this.databaseManger.updateProperty(this._wDB, userId, 'wallet_ballance', {wallet_balance: Number(amount.toPrecision(3))})
        return ResponseMessages.TransactionSuccessful
      }
      let { wallet_balance } = balance

      // FIX PRESCION FLOATING 
      wallet_balance = new Decimal(wallet_balance)
      amount = new Decimal(amount)

      wallet_balance.plus(amount)
      await this.databaseManger.updateProperty(this._wDB, userId, 'wallet_ballance', {wallet_balance: Number(wallet_balance.toPrecision(3))})

      return ResponseMessages.TransactionSuccessful
    } catch (err: any) {
      throw new BadRequestException({message: err.message})
    }
  }
  
  // API FOR INITIATING TRANSFER1
  // wite validations.
  async withdraw_funds(user: any, payload: WithdrawDTO) {
    const {userId, email, displayName} = user
    await this.verify_wallet_pin(userId, payload.wallet_pin)
    const { wallet_balance } = await this.get_wallet_balance(userId)
    try {
      if (wallet_balance >= payload.amount) {
        // CALL INITIATE TRANSFER FUNCTION
        let amount = payload.amount * 100
        let transfer = await initiateTransferToUserBank(user, amount, payload.recipient_code, payload.reference)
        if (transfer.status === true) {
          // SAVE TRANSFER REFERENCE AD RECIPIENT CODE TO DB
          // await this.transactions.record_user_transfer_transactions(userId, payload, transfer.data.transfer_code)
          return {
            transaction_ref: transfer.data.reference,
            transaction_date: transfer.data.createdAt,
            transaction_time: transfer.data.updatedAt,
            message: "Transfer Processing..."
          }
        }
        throw new BadRequestException({message: transfer.message})
        // MAKE WEBHOOK FUNCTION FOR VERIFYING TRANSFER STATUS
      } 
      throw new BadRequestException({message: 'Your wallet balance is low'})
    } catch(err: any) {
      await WithdrawalFailed(email, displayName, wallet_balance, payload.amount)
      throw new BadRequestException({message: err})
    }
  }

  async record_user_transfer_transaction(userId: any, payload: any, transfer_code: string) {
    try {
      // DEDUCT USER WALLET BALANCE
      await this.deduct_wallet_balance(userId, payload.amount)
      // SAVE TRANSFER REFERENCE AD RECIPIENT CODE TO DB
      await this.transactions.record_user_transfer_transactions(userId, payload, transfer_code)
      return;
    } catch(err: any) {
      console.log(err)
      throw new BadRequestException({message: err})
    }
  }

  // on successful balance withdrawal    (Transfer API), deduct wallet balance.
  // on successful payment verification (Verify Payments API) increase wallet balance.
}