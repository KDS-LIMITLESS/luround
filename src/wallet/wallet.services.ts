import { BadRequestException, Injectable } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import * as bcrypt from 'bcrypt'
import ResponseMessages from "../messageConstants.js";


@Injectable()
export class WalletService {

  _wDB = this.walletManager.userDB;

  constructor (private walletManager: DatabaseService) {}

  async add_bank_details(user: any, bank_details: any) {
    try {
      const { email} = user
      await this.walletManager.updateArr(this._wDB, email, "bank_details", [bank_details])
      return ResponseMessages.WalletDetailAdded
    } catch (err: any) {
      throw new BadRequestException({message: "An error occured" })
    }    
  }

  async create_wallet_pin(userId: string, pin: string) {
    const pin_hash = await bcrypt.hash(pin, 12)
    if (pin.length !== 4) throw new BadRequestException({message: "Pin length must be four digits."})
    await this.walletManager.updateDocument(this._wDB, userId, {'wallet_pin': pin_hash})
    return ResponseMessages.WalletPinCreated
  }

  async verify_wallet_pin(userId:string, wallet_pin: string) {
    const isUser = await this.walletManager.findOneDocument(this._wDB, '_id',  userId)
    if (isUser.wallet_pin) {
      const decrypt_pin = await bcrypt.compare(wallet_pin, isUser.wallet_pin)
      return decrypt_pin === true ? ResponseMessages.Success : ResponseMessages.InvalidWalletPin
    }
    throw new BadRequestException({message: ResponseMessages.SetWalletPin})
  }

  // on successful balance withdrawal    (Transfer API), deduct wallet balance.
  // on successful payment verification (Verify Payments API) increase wallet balance.
}