import { Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import ResponseMessages from "../messageConstants.js";
import { DatabaseService } from "../store/db.service.js";


@Injectable()
export class TransactionsManger {
  _tDB = this.databaseManger.transactionsDb

  constructor(private databaseManger: DatabaseService) {}

  async record_transaction(userId: string, payload: any) {
    let transaction = {
      service_id: payload.service_id,
      service_name: payload.service_name,
      amount: payload.service_fee,
      affliate_user: payload.affliate_user,
      transaction_status: payload.transaction_status,
      transaction_ref: payload.transaction_ref,
      transaction_date: Date.now()
    }
    let find_user_transactions = await this.databaseManger.findOneDocument(this._tDB, "_id", userId)
    if (find_user_transactions !== null) {
      let updateArray = await this.databaseManger.updateArr(this._tDB, "_id", new ObjectId(userId), "transactions", [transaction])
      return ResponseMessages.TransactionRecorded
    }
    await this.databaseManger.create(this._tDB, {"_id": new ObjectId(userId), transactions: [transaction]})
    return ResponseMessages.TransactionRecorded
  }

  async get_user_transactions(userId: string) {
    let get_transactions = await this.databaseManger.findOneDocument(this._tDB, "_id", userId)
    return get_transactions ? get_transactions.transactions : null
  }
}