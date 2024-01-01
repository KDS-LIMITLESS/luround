import { Injectable } from "@nestjs/common";
import { PaymentsAPI } from "../payments/paystack.sevices.js";
import { DatabaseService } from "../store/db.service.js";
import { Encrypter } from "../utils/Encryption.js";


@Injectable()
export class InvoiceService {

  _idb = this.databaseManager.invoiceDB
  _sdb = this.databaseManager.serviceDB
  _udb = this.databaseManager.userDB
  constructor(private databaseManager: DatabaseService,  private paymentsManager: PaymentsAPI) {}

  // Add payment link to invoice.
  async generate_invoice(user: any, invoice_data: any, service_id: string) {
   let encryption = new Encrypter(process.env.ENCRYPTION_KEY as string)
    const service_details = await this.databaseManager.findOneDocument(this._sdb, "_id", service_id)
    const service_provider = await this.databaseManager.findOneDocument(this._udb, "_id", service_details.service_provider_details.userId)
    let tx_ref = await this.paymentsManager.generateUniqueTransactionCode("LUROUND-INVOICE")

    const invoice = {
      userId: user.userId,
      service_provider_name: service_provider.displayName,
      service_provider_email: service_provider.email,
      service_provider_userId: service_provider._id.toString(),
      phone_number: invoice_data.phone_number,
      payment_reference_id: tx_ref,
      payment_status: "PENDING",
      
      invoice_details: {
        service_name: service_details.service_name,
        meeting_type: invoice_data.meeting_type,
        service_decription: service_details.description,
        rate: invoice_data.rate,
        duration: invoice_data.duration,
        discount: invoice_data.discount,
        quote_date: Date.now(),
        due_date: invoice_data.due_date,
      },
      quote_link: `https://luround.com/invoice/${service_details.service_name.replace(/\s/g, "_")}/${encryption.encrypt(user.userId)}`,
      notes: invoice_data.note || ''
    }

    let response: any = await PaymentsAPI.initiate_flw_payment(invoice.invoice_details.rate, user, invoice.phone_number, tx_ref, 
      {
        service_name: invoice.invoice_details.service_name, 
        payment_receiver: service_details.service_provider_details.displayName,
        payment_receiver_id: service_details.service_provider_details.userId
      }
    )
    let create_invoice = await this.databaseManager.create(this._idb, invoice)
    return {quoteId: create_invoice.insertedId, quote_link: invoice.quote_link, invoice_payment_link: response.data.link}
  }

  async get_paid_invoices(userId: string) {
    return await this._idb.find({"userId": userId, "payment_status": "SUCCESSFUL"}).toArray()
  }

  async get_unpaid_invoices(userId: string) {
    return await this._idb.find({"userId": userId, "payment_status": "PENDING"}).toArray()
  }
}