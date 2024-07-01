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

    let tx_ref = await this.paymentsManager.generateUniqueTransactionCode("INVOICE")
    let payment_amount = (5/100 * invoice_data.total) + invoice_data.total
    let payment_link = await this.paymentsManager.initializePayment(invoice_data.send_to_email, payment_amount, tx_ref)

    const invoice = {
      invoice_id,
      // userId: user.userId,
      send_to_name: invoice_data.send_to_name,
      send_to_email: invoice_data.send_to_email,
      service_provider: {
        name: user.displayName,
        email: user.email ,
        userId: user.userId,
        phone_number: phone_number['link'] || "",
        address: address['link'] || "",
        logo_url: user_profile.logo_url,
        bank_details: {bank: invoice_data.bank, account_name: invoice_data.account_name, account_number: invoice_data.account_number} || ""
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
      created_at: Date.now(),
      payment_link: payment_link.data.authorization_url,
      tx_ref

      //invoice_generated_from_quote: invoice_data.invoice_generated_from_quote
      // time: `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
    }

    // let response: any = await PaymentsAPI.initiate_flw_payment(invoice.invoice_details.rate, user, invoice.phone_number, tx_ref, 
    //   {
    //     service_name: invoice.invoice_details.service_name, 
    //     payment_receiver: service_details.service_provider_details.displayName,
    //     payment_receiver_id: service_details.service_provider_details.userId
    //   }
    // )
    try {
      let create_invoice = await this.databaseManager.create(this._idb, invoice)
      console.log(create_invoice)
      await this.databaseManager.updateArr(this._idb, "_id", new ObjectId(create_invoice.insertedId), "product_detail", invoice_data.product_detail)
      return { 
        invoice_id, service_provider_address: address['link'] || '', 
        service_provider_phone_number: phone_number['link'] || '', 
        payment_link: payment_link.data.authorization_url,
        processing_fee: invoice_data.sub_total * 0.05
      }

    } catch (err: any) {
      throw new BadRequestException({message: "Invoice Not sent"})
    }
  }

  async get_paid_invoices(userId: string) {
    return (await this._idb.find({"service_provider.userId": userId, "payment_status": "SUCCESSFUL"}).toArray()).reverse()
  }

  async get_unpaid_invoices(userId: string) {
    return (await this._idb.find({"service_provider.userId": userId, "payment_status": "PENDING"}).toArray()).reverse()
  }

  async get_invoice(invoice_id: string) {
    return await this.databaseManager.findOneDocument(this._idb, "_id", invoice_id)
  }

  async get_invoice_with_reference(tx_ref: string) {
    return await this.databaseManager.findOneDocument(this._idb, "tx_ref", tx_ref)
  }
  
  async enter_invoice_payment(invoice: any, data: any) {
    // let tx_ref = await this.paymentsManager.generateUniqueTransactionCode("INVOICE")
    try {
      // let get_invoice = await this.get_invoice(invoice.invoice_id)
      if (invoice !== null) {
        const payment_details = {
          amount_paid: data.amount_paid,
          // payment_method: data.payment_method,
          tx_ref: invoice.tx_ref
        }
      
        await this.databaseManager.updateDocument(this._idb, invoice._id.toString(), payment_details)
        await this.transactionsManger.record_transaction(invoice.service_provider.userId, {
          service_id: invoice.product_detail[0].service_id, service_name: invoice.product_detail[0].service_name, 
          service_fee: data.total, transaction_ref: payment_details.tx_ref, transaction_status: "RECEIVED", 
          affliate_user: invoice.send_to_name, customer_email: invoice.send_to_email
        })
        let book_service = await this.bookingService.book_service(
          invoice.product_detail[0], 
          invoice.product_detail[0].service_id, 
          {
            userId: invoice.service_provider.userId, 
            email: invoice.service_provider.email, 
            displayName: invoice.service_provider.displayName
          }, 
          invoice.invoice_id, data.total,
          payment_details.tx_ref, invoice.due_date, invoice.note, "True", data.phone_number
        )
  
        await this.bookingService.confirm_booking_with_invoice_id(invoice.invoice_id)
        return {book_service, product_detail: await this.databaseManager.updateProperty(this._idb, invoice._id, "payment_status", {payment_status: "SUCCESSFUL"})}
      }
      
    } catch(err: any) {
      throw new BadRequestException({message: "Invoice not found Error"})
    }
    
  }
  
  async delete_quote(invoice_id: string) {
    return (await this.databaseManager.delete(this._idb, invoice_id)).value
  }
}