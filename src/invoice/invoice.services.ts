import { BadRequestException, Injectable } from "@nestjs/common";
import { PaymentsAPI } from "../payments/paystack.sevices.js";
import { DatabaseService } from "../store/db.service.js";
import { Encrypter } from "../utils/Encryption.js";
import { ObjectId } from "mongodb";
import { BookingsManager } from "../bookService/bookService.sevices.js";


@Injectable()
export class InvoiceService {

  _idb = this.databaseManager.invoiceDB
  _sdb = this.databaseManager.serviceDB
  _udb = this.databaseManager.userDB
  constructor(private databaseManager: DatabaseService,  private bookingService: BookingsManager) {}

  // Add payment link to invoice.
  async generate_invoice(user: any, invoice_data: any) {
    const time = new Date()
    // let encryption = new Encrypter(process.env.ENCRYPTION_KEY as string)
    // const service_provider: any = await this.databaseManager.findOneDocument(this._udb, "email", email)

    // let tx_ref = await this.paymentsManager.generateUniqueTransactionCode("LUROUND-INVOICE")

    const invoice = {
      // userId: user.userId,
      send_to: invoice_data.send_to,
      sent_to_email: invoice_data.send_to_email,
      service_provider_name: user.displayName,
      service_provider_email: user.email,
      service_provider_userId: user.userId,
      phone_number: invoice_data.phone_number,
      // payment_reference_id: tx_ref,
      payment_status: "PENDING",
      discount: invoice_data.discount,
      vat: invoice_data.vat,
      sub_total: invoice_data.sub_total,
      total: invoice_data.total,
      // invoice_link: `https://luround.com/invoice/${encryption.encrypt(user.userId)}`,
      note: invoice_data.note,
      due_date: invoice_data.due_date,
      // time: `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
    }

    // let response: any = await PaymentsAPI.initiate_flw_payment(invoice.invoice_details.rate, user, invoice.phone_number, tx_ref, 
    //   {
    //     service_name: invoice.invoice_details.service_name, 
    //     payment_receiver: service_details.service_provider_details.displayName,
    //     payment_receiver_id: service_details.service_provider_details.userId
    //   }
    // )
    let book_service = await this.bookingService.book_service(invoice_data.booking_detail[0], invoice_data.booking_detail[0].serviceID, {userId: user.userId, email: user.email, displayName: user.displayName})
    if (book_service.BookingId) {
      let create_invoice = await this.databaseManager.create(this._idb, invoice)
      await this.databaseManager.updateArr(this._idb, "_id", new ObjectId(create_invoice.insertedId), "booking_detail", invoice_data.booking_detail)
      return book_service
    }
    throw new BadRequestException({message: "Invoice Not sent"})
    
  }

  async get_paid_invoices(userId: string) {
    return await this._idb.find({"userId": userId, "payment_status": "SUCCESSFUL"}).toArray()
  }

  async get_unpaid_invoices(userId: string) {
    return await this._idb.find({"userId": userId, "payment_status": "PENDING"}).toArray()
  }

  async delete_quote(quote_id: string) {
    return (await this.databaseManager.delete(this._idb, quote_id)).value
  }
}