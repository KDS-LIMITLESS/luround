import { BadRequestException, Injectable } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import * as bcrypt from 'bcrypt'
import ResponseMessages from "../messageConstants.js";
import { ObjectId } from "mongodb";


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

  async create_wallet(userId: string, pin: string) {
    try {
      const pin_hash = await bcrypt.hash(pin, 12)
      if (pin.length !== 4) throw new BadRequestException({message: "Pin length must be four digits."})
      await this.databaseManger.create(this._wDB, {"_id": new ObjectId(userId), 'wallet_pin': pin_hash, wallet_balance: 0})
      return ResponseMessages.WalletPinCreated
    } catch(err: any) {
      throw new BadRequestException({message: err.message})
    }    
  }

  async verify_wallet_pin(userId:string, wallet_pin: string) {
    const isUser:any = await this.databaseManger.findOneDocument(this._wDB, '_id',  userId)
    if (isUser.wallet_pin) {
      const decrypt_pin = await bcrypt.compare(wallet_pin, isUser.wallet_pin)
      return decrypt_pin === true ? ResponseMessages.Success : ResponseMessages.InvalidWalletPin
    }
    throw new BadRequestException({message: ResponseMessages.SetWalletPin})
  }

  async get_wallet_balance(userId: string){
    let getWallet =  await this.databaseManger.findOneDocument(this._wDB, "_id", userId)
    return getWallet ?  {wallet_balance: getWallet.wallet_balance} : ResponseMessages.WalletNotFound
  }
  // on successful balance withdrawal    (Transfer API), deduct wallet balance.
  // on successful payment verification (Verify Payments API) increase wallet balance.
}