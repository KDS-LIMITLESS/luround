import { Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { DatabaseService } from "../store/db.service.js";


@Injectable()
export class CRMService {

  _crmdb = this.databaseService.crmDB
  _txnsDB = this.databaseService.transactionsDb
  constructor(private databaseService: DatabaseService) {}

  async add_new_contact(userId: any, contact: any) {
    if (await this.databaseService.findOneDocument(this._crmdb, "_id", userId)) {
      await this.databaseService.updateArr(this._crmdb, "_id", new ObjectId(userId), "contacts", [contact])
      return "New Contact Added"
    }
    await this.databaseService.create(this._crmdb, {"_id": new ObjectId(userId), "contacts": [contact]})
    return "New Contact Added"
  }

  async get_user_contacts(userId: string) {
    try {
      let { contacts } = await this.databaseService.findOneDocument(this._crmdb, "_id", userId)
      return contacts
    } catch (err) {
      return []
    }
  }

  async get_customer_transaction_history(userId: string, customer_email: string) {
    let txns_history = []
    let user_transactions = await this.databaseService.findOneDocument(this._txnsDB, "_id", userId)
    user_transactions.transactions.map(function (customer) {
      customer.customer_email === customer_email ? txns_history.push({
        service_name: customer.service_name, 
        amount: customer.amount,
        email: customer.customer_email, 
        date: customer.transaction_date
      }): []
    })
    return txns_history
  }
}