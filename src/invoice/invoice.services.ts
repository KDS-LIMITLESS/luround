import { BadRequestException, Injectable } from "@nestjs/common";
import { PaymentsAPI } from "../payments/paystack.sevices.js";
import { DatabaseService } from "../store/db.service.js";
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

  async generate_invoice(user: any, invoice_data: any) {
    
    const [user_mLinks, user_profile, invoice_id, tx_ref] = await Promise.all([
      this.userProfile.get_user_media_links(user.email),
      this.userProfile.get_user_profile(user),
      generateRandomSixDigitNumber(),
      this.paymentsManager.generateUniqueTransactionCode("INVOICE")
    ]);
  
    const phone_number_obj = user_mLinks.find((obj) => obj['name'] === 'Mobile') || {};
    const address_obj = user_mLinks.find((obj) => obj['name'] === 'Location') || {};
  
    let payment_amount: number = 0.035 * Number(invoice_data.total) + Number(invoice_data.total);
    payment_amount = Math.round(payment_amount) // new Decimal(payment_amount).toPrecision(6)
    
    const payment_link = await this.paymentsManager.initializePayment(invoice_data.send_to_email, payment_amount, tx_ref);
    const invoice = {
      invoice_id,
      send_to_name: invoice_data.send_to_name,
      send_to_email: invoice_data.send_to_email,
      service_provider: {
        name: user.displayName,
        email: user.email,
        userId: user.userId,
        phone_number: phone_number_obj['link'] || "",
        address: address_obj['link'] || "",
        logo_url: user_profile.logo_url,
      },
      bank_details: {
        bank: "",
        account_name: "",
        account_number: ""
      },
      phone_number: invoice_data.phone_number,
      payment_status: "PENDING",
      discount: invoice_data.discount,
      vat: invoice_data.vat,
      sub_total: invoice_data.sub_total,
      total: invoice_data.total,
      note: invoice_data.note,
      due_date: invoice_data.due_date,
      created_at: Date.now(),
      payment_link: await payment_link,
      tx_ref
    };
  
    try {
      const create_invoice = await this.databaseManager.create(this._idb, invoice);
      await this.databaseManager.updateArr(this._idb, "_id", new ObjectId(create_invoice.insertedId), "product_detail", invoice_data.product_detail);
      return { 
        invoice_id,
        service_provider_address: address_obj['link'] || '',
        service_provider_phone_number: phone_number_obj['link'] || '',
        payment_link: payment_link,
        processing_fee: Number(invoice_data.sub_total) * 0.035
      };
    } catch (err: any) {
      console.log(err)
      throw new BadRequestException({ message: "Invoice Not sent" });
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
      
        await this.databaseManager.updateDocument(this._idb, invoice._id.toString(), {payment_details})
        // -await this.transactionsManger.record_transaction(invoice.service_provider.userId, {
        // -  service_id: invoice.product_detail[0].service_id, service_name: invoice.product_detail[0].service_name, 
        // -  service_fee: invoice.product_detail[0].total, transaction_ref: payment_details.tx_ref, transaction_status: "RECEIVED", 
        // -  affliate_user: invoice.send_to_name, customer_email: invoice.send_to_email
        // -})
        let book_service = await this.bookingService.book_service(
          invoice.product_detail[0], 
          invoice.product_detail[0].service_id, 
          {
            userId: invoice.service_provider.userId, 
            email: invoice.service_provider.email, 
            displayName: invoice.service_provider.displayName
          }, 
          invoice.invoice_id, invoice.product_detail[0].total,
          payment_details.tx_ref, invoice.due_date, invoice.note, "True", invoice.phone_number
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