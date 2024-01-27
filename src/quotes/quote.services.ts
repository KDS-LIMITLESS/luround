import { BadRequestException, Injectable } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import { Encrypter } from "../utils/Encryption.js";
import { ObjectId } from "mongodb";
import ResponseMessages from "../messageConstants.js";
import { ProfileService } from "../profileManager/profile.service.js";
import { generateRandomSixDigitNumber } from "../utils/mail.services.js";


@Injectable()
export class QuotesService {
  _qdb = this.databaseManager.quotes
  _udb = this.databaseManager.userDB
  _sdb = this.databaseManager.serviceDB
  constructor(private databaseManager: DatabaseService, private userProfile: ProfileService) {}

  async send_quote(user: any, data: any) {
    // let encryption = new Encrypter(process.env.ENCRYPTION_KEY as string)
    const user_mLinks = await this.userProfile.get_user_media_links(user.email)
    const user_profile = await this.userProfile.get_user_profile(user)
    const quote_id = await generateRandomSixDigitNumber()


    const phone_number = user_mLinks.find((obj) => obj['name'] === 'Mobile') || ""
    const address = user_mLinks.find((obj) => obj['name'] === 'Location') || ""

    const quote_details = {
      quote_id,
      // userId: user.userId,
      send_to_name: data.send_to_name,
      send_to_email: data.send_to_email,
      phone_number: data.phone_number,
      // quote_link: `https://luround.com/quote/${encryption.encrypt(user.userId)}`,
      due_date: data.due_date,
      quote_date: data.quote_date,
      sub_total: data.sub_total,
      discount: data.discount,
      vat: data.vat,
      total: data.total,
      appointment_type: data.appointment_type,
      status: data.status,
      note: data.note || '',
      created_at: Date.now(),
      service_provider: {
        name: user.displayName,
        email: user.email,
        userId: user.userId,
        phone_number: phone_number['link'] || "",
        address: address['link'] || "",
        logo_url: user_profile.logo_url
      } 
    }
    let quote = await this.databaseManager.create(this._qdb, quote_details)
    await this.databaseManager.updateArr(this._qdb, "_id", new ObjectId(quote.insertedId), "product_details", data.product_detail)
    return {quote_id, service_provider_address: address['link'] || '', service_provider_phone_number: phone_number['link'] || ''}
  }

  async get_saved_quotes(userId: string) {
    return await this._qdb.find({"status": "SAVED", "service_provider.userId": userId }).toArray()
  }

  async get_sent_quotes(userId: string) {
    return await this._qdb.find({"status": "SENT", "service_provider.userId": userId }).toArray()
  }

  async get_received_quotes(userId: string) {
    return await this._qdb.find({"quote_to.userId": userId, "status": "REQUEST"}).toArray()
  }

  async delete_quote(quote_id: string) {
    return (await this.databaseManager.delete(this._qdb, quote_id)).value
  }

  async request_quote(data:any, serviceId:string) {
    
    const service = await this.databaseManager.findOneDocument(this._sdb, "_id", serviceId)
    const user_mLinks = await this.userProfile.get_user_media_links(service.service_provider_details.email)

    let user = {email: service.service_provider_details.email}
    const user_profile = await this.userProfile.get_user_profile(user)

    const quote_id = await generateRandomSixDigitNumber()

    const phone_number = user_mLinks.find((obj) => obj['name'] === 'Mobile') || ""
    const address = user_mLinks.find((obj) => obj['name'] === 'Location') || ""

    if (service !== null) {
      const quote_details = {
        quote_id,
        user_email: data.user_email,
        full_name: data.full_name,
        quote_to: {
          userId: service.service_provider_details.userId,
          email: service.service_provider_details.email,
          displayName: service.service_provider_details.displayName,
          phone_number: phone_number['link'] || "",
          address: address['link'] || "",
          logo_url: user_profile.logo_url
        },
        phone_number: data.phone_number,
        service_name: service.service_name,
        appointment_type: data.appointment_type,
        budget: data.budget,
        file: data.file || "",
        note: data.note || "",
        status: "REQUEST",
        created_at: Date.now()
      }
      return await this.databaseManager.create(this._qdb, quote_details)
    }
    throw new BadRequestException({message: ResponseMessages.ServiceNotFound})
  }
    
}