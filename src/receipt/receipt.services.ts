import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import { ObjectId } from "mongodb";
import { ProfileService } from "../profileManager/profile.service.js";


@Injectable()
export class ReceiptService {

  _rpdb = this.databaseManager.receiptsDB
  constructor(private databaseManager: DatabaseService, private userProfile: ProfileService) {}

  async generate_receipt(user: any, receipt_data: any) {
    const {displayName, userId, email} = user
    const user_mLinks = await this.userProfile.get_user_media_links(email)

    const phone_number = user_mLinks.find((obj) => Object.getOwnPropertyDescriptor(obj, "github")) || ""
    const address = user_mLinks.find((obj) => Object.getOwnPropertyDescriptor(obj, "address")) || ""

    const receipt = {
      send_to_name: receipt_data.send_to_name,
      sent_to_email: receipt_data.send_to_email,

      service_provider_name: displayName,
      service_provider_email: email,
      service_provider_userId: new ObjectId(userId),
      service_provider_phone_number: phone_number['phone_number'] || "",
      service_provider_address: address['address'] || "",

      phone_number: receipt_data.phone_number,
      payment_status: receipt_data.payment_status,
      discount: receipt_data.discount,
      vat: receipt_data.vat,
      sub_total: receipt_data.sub_total,
      total: receipt_data.total,
      note: receipt_data.note,
      mode_of_payment: receipt_data.mode_of_payment,
      receipt_date: receipt_data.receipt_date,
    }

    let new_receipt = await this.databaseManager.create(this._rpdb, receipt)
    await this.databaseManager.updateArr(this._rpdb, "_id", new ObjectId(new_receipt.insertedId), "product_detail", receipt_data.product_detail)
    return new_receipt    
  }

  async get_receipts(userId: string) {
    console.log(userId)
    return await this._rpdb.find({"service_provider_userId": new ObjectId(userId), "payment_status": "SENT"}).toArray()
  }

  async get_saved_receipts(userId: string) {
    return await this._rpdb.find({"service_provider_userId": new ObjectId(userId), "payment_status": "DRAFT"}).toArray()
  }

  async delete_receipt(receipt_id: string) {
    return (await this.databaseManager.delete(this._rpdb, receipt_id)).value
  }

  async update_receipt_status(receipt_id: string) {
    return await this.databaseManager.updateProperty(this._rpdb, receipt_id, "payment_status", {payment_status: "SENT"})
  }
}