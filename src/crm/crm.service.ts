import { BadRequestException, Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { DatabaseService } from "../store/db.service.js";
import { ContactDTO } from "./crmDto.js";


@Injectable()
export class CRMService {

  _crmdb = this.databaseService.crmDB
  _txnsDB = this.databaseService.transactionsDb
  constructor(private databaseService: DatabaseService) {}

  async add_new_contact(userId: any, contact: any) {
    let user_contacts = await this.databaseService.findOneDocument(this._crmdb, "_id", userId)
    if (user_contacts) {
      let find_existing_contact = user_contacts.contacts.find((obj) => obj.email === contact.email)
      if (find_existing_contact === undefined) {
        // CONTACT DOES NOT EXIST YET
        await this.databaseService.updateArr(this._crmdb, "_id", new ObjectId(userId), "contacts", [contact])
        return "New Contact Added"
      }
      // NOW CONTACT EXISTS, UPDATE CERTAIN FIELDS OF THE CONTACT
      return "Contact already Exists"
    }
    await this.databaseService.create(this._crmdb, {"_id": new ObjectId(userId), "contacts": [contact]})
    return "New Contact Added"
  }

  async get_user_contacts(userId: string) {
    try {
      let { contacts } = await this.databaseService.findOneDocument(this._crmdb, "_id", userId)
      return contacts.sort((a, b) => a.name.localeCompare(b.name))
    } catch (err) {
      return []
    }
  }

  async get_customer_transaction_history(userId: string, customer_email: string) {
    let txns_history = []
    let user_transactions = await this.databaseService.findOneDocument(this._txnsDB, "_id", userId)
    if (user_transactions !== null) {
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
    return txns_history
    
  }

  async delete_customer_contact(userId: string, obj: ContactDTO) {
    let delElem = await this.databaseService.deletefromArray(this._crmdb, userId, "contacts", obj ) 
    if (delElem.modifiedCount === 1) return "Contact Deleted"
    throw new BadRequestException({message: "Item not found in array."})
  }
}