import { BadRequestException, Injectable } from "@nestjs/common";
import { PaymentsAPI } from "../payments/paystack.sevices.js";
import { DatabaseService } from "../store/db.service.js";
import { Encrypter } from "../utils/Encryption.js";
import { ObjectId } from "mongodb";
import { BookingsManager } from "../bookService/bookService.sevices.js";
import { ProfileService } from "../profileManager/profile.service.js";
import { generateRandomSixDigitNumber } from "../utils/mail.services.js";
import { TransactionsManger } from "../transaction/tansactions.service.js";


@Injectable()
export class InvoiceService {

  _idb = this.databaseManager.invoiceDB
  _sdb = this.databaseManager.serviceDB
  _udb = this.databaseManager.userDB
  constructor(
    private databaseManager: DatabaseService,  
    private bookingService: BookingsManager, 
    private userProfile: ProfileService,
    private paymentsManager: PaymentsAPI,
    private transactionsManger: TransactionsManger,
  ) {}

  // Add payment link to invoice.
  async generate_invoice(user: any, invoice_data: any) {
    const time = new Date()
    const user_mLinks = await this.userProfile.get_user_media_links(user.email)
    const user_profile = await this.userProfile.get_user_profile(user)
    const invoice_id = await generateRandomSixDigitNumber()


    const phone_number = user_mLinks.find((obj) => obj['name'] === 'Mobile') || ""
    const address = user_mLinks.find((obj) => obj['name'] === 'Location') || ""

    // let encryption = new Encrypter(process.env.ENCRYPTION_KEY as string)
    // const service_provider: any = await this.databaseManager.findOneDocument(this._udb, "email", email)

    // let tx_ref = await this.paymentsManager.generateUniqueTransactionCode("LUROUND-INVOICE")

    const invoice = {
      invoice_id,
      // userId: user.userId,
      send_to_name: invoice_data.send_to_name,
      sent_to_email: invoice_data.send_to_email,
      service_provider: {
        name: user.displayName,
        email: user.email ,
        userId: user.userId,
        phone_number: phone_number['link'] || "",
        address: address['link'] || "",
        logo_url: user_profile.logo_url
      },
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
      created_at: Date.now()
      // time: `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
    }

    // let response: any = await PaymentsAPI.initiate_flw_payment(invoice.invoice_details.rate, user, invoice.phone_number, tx_ref, 
    //   {
    //     service_name: invoice.invoice_details.service_name, 
    //     payment_receiver: service_details.service_provider_details.displayName,
    //     payment_receiver_id: service_details.service_provider_details.userId
    //   }
    // )
    let book_service = await this.bookingService.book_service(invoice_data.product_detail[0], invoice_data.product_detail[0].service_id, {userId: user.userId, email: user.email, displayName: user.displayName})
    if (book_service.BookingId) {
      let create_invoice = await this.databaseManager.create(this._idb, invoice)
      await this.databaseManager.updateArr(this._idb, "_id", new ObjectId(create_invoice.insertedId), "product_detail", invoice_data.product_detail)
      return {book_service, invoice_id, service_provider_address: address['link'] || '', service_provider_phone_number: phone_number['link'] || ''}
    }
    throw new BadRequestException({message: "Invoice Not sent"})
    
  }

  async get_paid_invoices(userId: string) {
    return await this._idb.find({"service_provider.userId": userId, "payment_status": "SUCCESSFUL"}).toArray()
  }

  async get_unpaid_invoices(userId: string) {
    return await this._idb.find({"service_provider.userId": userId, "payment_status": "PENDING"}).toArray()
  }

  async get_invoice(invoice_id: string) {
    return await this.databaseManager.findOneDocument(this._idb, "_id", invoice_id)
  }

  async enter_invoice_payment(invoice_id: string, data: any) {
    let tx_ref = await this.paymentsManager.generateUniqueTransactionCode("INVOICE")

    const payment_details = {
      amount_paid: data.amount_paid,
      payment_method: data.payment_method
    }
    let [invoice, _] = await Promise.all([await this.get_invoice(invoice_id), await this.databaseManager.updateDocument(this._idb, invoice_id, payment_details) ])
    await this.transactionsManger.record_transaction(invoice.service_provider.userId, {
      service_id: invoice.product_detail[0].service_id, service_name: invoice.product_detail[0].service_name, 
      service_fee: data.amount_paid, transaction_ref: tx_ref, transaction_status: "RECEIVED", 
      affliate_user: invoice.send_to_name
    })
    return await this.databaseManager.updateProperty(this._idb, invoice_id, "payment_status", {payment_status: "SUCCESSFUL"})
  }
  
  async delete_quote(invoice_id: string) {
    return (await this.databaseManager.delete(this._idb, invoice_id)).value
  }
}