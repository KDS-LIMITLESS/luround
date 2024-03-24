import { BadRequestException, Injectable } from "@nestjs/common";
import { request } from "https";
import Flutterwave from 'flutterwave-node-v3';
import { DatabaseService } from "../store/db.service.js";
import { sendPaymentSuccessMail } from "../utils/mail.services.js";

const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY)


@Injectable()
export class PaymentsAPI {
  _bkDb = this.databaseManager.bookingsDB
  _pdb = this.databaseManager.payment
  _idb = this.databaseManager.invoiceDB
  _udb = this.databaseManager.userDB

  constructor(private databaseManager: DatabaseService) {}

  static async initializePayment(email: string, amount: string): Promise<any> {
    const data = JSON.stringify({
      'email': email,
      'amount': amount,
      'plan': 'PLN_ub6qpgfwsc3820e'
    });

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${process.env.PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      }
    };
    return await this.makeRequest(data, options)
  };
  
  async verifyPayment(transaction_ref: string, userId: any) {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${transaction_ref}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      }
    }    
    try {
      let request: any = await PaymentsAPI.makeRequest(transaction_ref, options)
      if (request.data.status === 'success') {
        console.log(request)
        let user = await this.databaseManager.findOneDocument(this._udb, "_id", userId)
        let date = new Date(`${request.data.paid_at}`)
        await this.databaseManager.updateDocument(this._udb, userId, {account_status: "ACTIVE", payment_details: {
          start_date: request.data.paid_at,
          expiry_date: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000),
          authourization: request.data.authorization,
          sent_expiry_email: false,
          current_plan: request.data.amount === "4200" ? "Monthly": "Yearly",
          transaction_ref
        }})
        await sendPaymentSuccessMail(user.email, user.displayName, request.data.amount === "4200" ? "Monthly": "Yearly" )
        return {status: request.data.status, plan: request.data.amount === "4200" ? "Monthly": "Yearly"}
      } 
      throw new BadRequestException({message: request.data.status, transaction_ref})
    } catch (err: any) {
      throw new BadRequestException({message: err.message })
    }
    
  }

  static async create_yearly_payment_plan() {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/plan`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      }
    }
    const data = JSON.stringify({
      'name': 'Monthly Plan',
      "interval": "annually",
      "amount": "2520000"
    })

    return await this.makeRequest(data, options)
  }
  
  static async makeRequest(data: any, options: {}) {
    return new Promise(function(resolve, reject) {
      const req = request(options, function (res) {
        let responseData = '';
    
        res.on('data', (chunk) => {
          responseData += chunk;
        });
    
        res.on('end', () => {
          const parsedData = JSON.parse(responseData);
          resolve(parsedData); 
        });
    
      }).on('error', (error) => {
        reject(error); 
        throw new BadRequestException({
          statusCode: 400,
          message: error.message
        })
      });
      req.write(data);
      req.end();  
    })
  }

  static async create_monthly_payment_plan() {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/plan`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      }
    }
    const data = JSON.stringify({
      'name': 'Monthly Plan',
      "interval": "monthly",
      "amount": "420000"
    })

    return await this.makeRequest(data, options)
  }

//   static async initiate_flw_payment(amount: string, req: any, phone_number: string, tx_ref: any, booking_detail: any) {
//     try {
//       const response = await got.post("https://api.flutterwave.com/v3/payments", {
//         headers: {
//             Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
//         },
//         json: {
//           tx_ref: tx_ref,
//           amount: amount,
//           currency: "NGN",
//           redirect_url: `https://luround.onrender.com/api/v1/payments/verify-flw-payment`,
//           meta: {
//             consumer_id: req.userId,
//             consumer_name: req.displayName,
//             service_name: booking_detail.service_name,
//             payment_receiver_name: booking_detail.payment_receiver,
//             payment_receiver_id: booking_detail.payment_receiver_id
//           },
//           customer: {
//               email: req.email,
//               phonenumber: phone_number,
//               name: req.displayName
//           },
//           customizations: {
//               title: "Luround Pay",
//               logo: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png"
//           }
//         }
//       }).json()
//     return response
//   } catch (err) {
//       throw new BadRequestException({ message: err.message})
//     }
//   }

//   async verify_flw_payment(query: any ) {
//     if (query.status === 'successful') {
//       // const transactionDetails = await Transaction.find({ref: query.tx_ref});
//       const response = await flw.Transaction.verify({id: query.transaction_id});
//     if (
//       response.data.status === "successful"
//       && response.data.amount === response.data.charged_amount
//       && response.data.currency === "NGN"
//     ){
//       let transaction_details = {
//         transaction_reference: response.data.tx_ref,
//         payee_info: {email: response.data.customer.email, userId: response.data.meta.consumer_id, displayName: response.data.meta.consumer_name },
//         payment_receiver_info: {display_name: response.data.meta.payment_receiver_name, userId: response.data.meta.payment_receiver_id},
//         amount_paid: response.data.charged_amount,
//         created_at: response.data.created_at,
//       }
//       if (query.tx_ref.startsWith("LUROUND-INVOICE")) {
//         let get_invoice = await this.databaseManager.findOneDocument(this._idb, "payment_reference_id", query.tx_ref)
//         if (get_invoice !== null) {
//           await this.databaseManager.updateProperty(this._idb, get_invoice._id, "payment_status", {payment_status: "SUCCESSFUL"})
//           let payment_ref_id = (await this.databaseManager.create(this._pdb, transaction_details)).insertedId
//           await sendPaymentSuccessMail(response.data.customer.email, response.data.meta.consumer_name, response.data.meta.payment_receiver_name, response.data.charged_amount, response.data.meta.service_name )
//           return {booking_status: "Success", payment_ref_id, transaction_ref: response.data.tx_ref }
//         }
//       }
//         // get booking where transaction_ref matches response.data.tx_ref
//       let get_booking_reference = await this.databaseManager.findOneDocument(this._bkDb, "payment_reference_id", query.tx_ref)
//       // update the booked_status to successful. 
//       if (get_booking_reference !== null) {
//         // UPDATE MATCHING BOOKING STATUS
//         await this.databaseManager.updateProperty(this._bkDb, get_booking_reference._id, "booked_status", {booked_status: "SUCCESSFUL"})
//         // SET WALLET BALANCE
//         await this.walletService.increase_wallet_balance(response.data.meta.payment_receiver_id, response.data.charged_amount)
//         // SAVE PAYMENT DETAILS TO DATABASE
//         let payment_ref_id = (await this.databaseManager.create(this._pdb, transaction_details)).insertedId
//         await sendPaymentSuccessMail(response.data.customer.email, response.data.meta.consumer_name, response.data.meta.payment_receiver_name, response.data.charged_amount, response.data.meta.service_name )
//         return {booking_status: "Success", payment_ref_id, transaction_ref: response.data.tx_ref }
//       }
//       throw new BadRequestException({message: ResponseMessages.PaymentNotResolved})
//     } else {
//         await paymentFailed(response.data.customer.email, response.data.meta.consumer_name, response.data.meta.payment_receiver_name, response.data.charged_amount, response.data.meta.service_name )
//         throw new BadRequestException({message: "Payment Failed"})
//       }
//     }
//   }

  async generateUniqueTransactionCode(prefix: string): Promise<string> {
  
    const timestamp = Date.now().toString(); // Get current timestamp
    let random_string = await generate_random_string(8)
    let tx_ref = `${prefix}-${timestamp}-${random_string}`;
  
    return tx_ref;
  }

}

async function generate_random_string(length: number) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let i, result= "";
  for (i = 0; i <= length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result
}
// Users should be able to pay for services from their wallet balance.