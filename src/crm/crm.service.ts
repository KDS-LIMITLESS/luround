import { Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { DatabaseService } from "../store/db.service.js";

@Injectable()
export class CRMService {

  _crmdb = this.databaseService.crmDB
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
}