import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";

@Injectable()
export class QuotesService {
  _qdb = this.databaseManager.quotes
  _udb = this.databaseManager.userDB
  _sdb = this.databaseManager.serviceDB
  constructor(private databaseManager: DatabaseService) {}

  async send_quote(user: any, service_id: string, data: any) {
    const service_details = await this.databaseManager.findOneDocument(this._sdb, "_id", service_id)
    const service_provider = await this.databaseManager.findOneDocument(this._udb, "_id", service_details.service_provider_details.userId)

    const quote_details = {
      userId: user.userId,
      service_provider_name: service_provider.displayName,
      service_provider_email: service_provider.email,
      service_provider_userId: service_provider._id.toString(),
      phone_number: data.phone_number,
      
      quote_details: {
        service_name: service_details.service_name,
        meeting_type: data.meeting_type,
        service_decription: service_details.description,
        rate: data.rate,
        duration: data.duration,
        discount: data.discount,
        quote_date: Date.now(),
        due_date: data.due_date,
      },
      notes: data.note || ''
    }
    return (await this.databaseManager.create(this._qdb, quote_details)).insertedId
  }

  async get_sent_quotes(userId: string) {
    return await this.databaseManager.readAndWriteToArray(this._qdb, "userId", userId)
  }

  async get_received_quotes(userId: string) {
    return await this.databaseManager.readAndWriteToArray(this._qdb, "service_provider_userId", userId)
  }
}