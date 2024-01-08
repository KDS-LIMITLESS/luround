import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import { Encrypter } from "../utils/Encryption.js";
import { ObjectId } from "mongodb";


@Injectable()
export class QuotesService {
  _qdb = this.databaseManager.quotes
  _udb = this.databaseManager.userDB
  _sdb = this.databaseManager.serviceDB
  constructor(private databaseManager: DatabaseService) {}

  async send_quote(user: any, email: string, data: any) {
    let encryption = new Encrypter(process.env.ENCRYPTION_KEY as string)
    const user_detail: any = await this.databaseManager.findOneDocument(this._udb, "email", email)

    const quote_details = {
      userId: user.userId,
      service_provider_name: user_detail.displayName,
      service_provider_email: user_detail.email,
      service_provider_userId: user_detail._id,
      phone_number: data.phone_number,
      quote_link: `https://luround.com/quote/${encryption.encrypt(user.userId)}`,
      notes: data.notes || '',
      due_date: data.due_date,
      sub_total: data.sub_total,
      discount: data.discount,
      vat: data.vat,
      total: data.total
    }
    // const product_details = [{
    //   // service_name: user_detail.service_name,
    //   service_name: data.product_detail.service_name,
    //   meeting_type: data.product_detail.meeting_type,
    //   service_decription: data.product_detail.description || "",
    //   rate: data.product_detail.rate,
    //   duration: data.product_detail.duration,
    //   discount: data.product_detail.discount,
    //   quote_date: Date.now(),
    //   vat: data.product_detail.vat
    // }]
      
    let quote = await this.databaseManager.create(this._qdb, quote_details)
    await this.databaseManager.updateArr(this._qdb, "_id", new ObjectId(quote.insertedId), "product_details", data.product_detail)
    return {quoteId: quote.insertedId, quote_link: quote_details.quote_link}
  }

  async get_sent_quotes(userId: string) {
    return await this.databaseManager.readAndWriteToArray(this._qdb, "userId", userId)
  }

  async get_received_quotes(userId: string) {
    return await this.databaseManager.readAndWriteToArray(this._qdb, "service_provider_userId", userId)
  }

  async delete_quote(quote_id: string) {
    return (await this.databaseManager.delete(this._qdb, quote_id)).value
  }
}