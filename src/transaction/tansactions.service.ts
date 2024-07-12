import { BadGatewayException, BadRequestException, Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import ResponseMessages from "../messageConstants.js";
import { DatabaseService } from "../store/db.service.js";


@Injectable()
export class TransactionsManger {
  _tDB = this.databaseManger.transactionsDb

  constructor(private databaseManger: DatabaseService) {}

  async record_transaction(userId: string, payload: any) {
    let dt = new Date()
    let transaction = {
      service_id: payload.service_id,
      service_name: payload.service_name,
      amount: payload.service_fee || payload.amount,
      affliate_user: payload.affliate_user,
      customer_email: payload.customer_email,
      transaction_status: payload.transaction_status,
      transaction_ref: payload.transaction_ref,
      transaction_date: Date.now(),
      transaction_time: dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds()
    }
    let find_user_transactions = await this.databaseManger.findOneDocument(this._tDB, "_id", userId)
    if (find_user_transactions !== null) {
      let updateArray = await this.databaseManger.updateArr(this._tDB, "_id", new ObjectId(userId), "transactions", [transaction])
      return ResponseMessages.TransactionRecorded
    }
    await this.databaseManger.create(this._tDB, {"_id": new ObjectId(userId), transactions: [transaction]})
    return ResponseMessages.TransactionRecorded
  }

  async record_user_transfer_transactions(userId: string, payload: any, transfer_code:string) {
    let dt = new Date()
    let transfers = {
      reference: payload.reference,
      recipient_code: payload.recipient_code,
      reason: payload.reason || '',
      transfer_code,
      amount: payload.amount,
      transfer_status: "transfer.success",
      transfer_verification_date: `${dt.getDate()}/${dt.getMonth()}/${dt.getFullYear()}`,
      transfer_verification_time: (dt.getHours() +1) + ":" + dt.getMinutes() + ":" + dt.getSeconds()
    }
    let find_user_transactions = await this.databaseManger.findOneDocument(this._tDB, "_id", userId)
    if (find_user_transactions !== null) {
      await this.databaseManger.updateArr(this._tDB, "_id", new ObjectId(userId), "transfers", [transfers])
      return ResponseMessages.TransactionRecorded
    }
    await this.databaseManger.create(this._tDB, {"_id": new ObjectId(userId), transfers: [transfers]})
    return ResponseMessages.TransactionRecorded
  }

  async get_user_transactions(userId: string) {
    let get_transactions = await this.databaseManger.findOneDocument(this._tDB, "_id", userId)
    return get_transactions ? get_transactions.transactions : []
  }

  async get_user_transfers(userId: string) {
    let get_transfers = await this.databaseManger.findOneDocument(this._tDB, "_id", userId)
    return get_transfers ? get_transfers.transfers : []
  }

  async update_user_transfer_status(userId: string, ref_code:string, transfer_status:string) {
    let get_user_records = await this.databaseManger.findOneDocument(this._tDB, "_id", userId )
    if (get_user_records !== null) {
      let transfers: [] = get_user_records.transfers

      let find_reference = transfers.find((element: any) => {element.reference === ref_code})
      if (find_reference !== undefined) {
        let reference = "find_reference.reference"
        await this.databaseManger.updateProperty(this._tDB, userId, reference, {transfer_status: transfer_status})
      }
      throw new BadRequestException({message: "Transfer Reference Not Found"})
    }
    throw new BadGatewayException({message: "User transaction details not found"})
  }
}