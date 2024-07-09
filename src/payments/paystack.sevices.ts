import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { request } from "https";
import Flutterwave from 'flutterwave-node-v3';
import { DatabaseService } from "../store/db.service.js";
import { sendPaymentSuccessMail } from "../utils/mail.services.js";
import { ObjectId } from "mongodb";
import ResponseMessages from "../messageConstants.js";
import { WalletService } from "../wallet/wallet.services.js";
import { error } from "console";

const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY)


@Injectable()
export class PaymentsAPI {
  _bkDb = this.databaseManager.bookingsDB
  _pdb = this.databaseManager.payment
  _idb = this.databaseManager.invoiceDB
  _udb = this.databaseManager.userDB
  _spm = this.databaseManager.servicePaymentDB
  _uWDB = this.databaseManager.userDB;

  constructor(private databaseManager: DatabaseService, private walletService: WalletService) {}

  async initializePayment(email: string, amount: number, reference: string): Promise<any> {
    const data = JSON.stringify({
      'email': email,
      'amount': amount * 100,
      "reference": reference
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
    let response:any = await PaymentsAPI.makeRequest(data, options)
    console.log(response)
    return response.data.authorization_url
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
        await this.create_user_payment_details(userId, {payment_date: request.data.paid_at, plan: request.data.amount, amount: request.data.amount})
        await sendPaymentSuccessMail(user.email, user.displayName, request.data.amount === "4200" ? "Monthly": "Yearly" )
        return {status: request.data.status, plan: request.data.amount === "4200" ? "Monthly": "Yearly"}
      } 
      throw new BadRequestException({message: request.data.status, transaction_ref})
    } catch (err: any) {
      throw new BadRequestException({message: err.message })
    }
    
  }


  // MAKE ENDPOINT FOR VERIFYING PAYMENTS MADE FROM SERVICES
  // INCREASE USERS WALLET BALANCE

  // REFACTOR FUNCTION FOR WITHDRAWING USERS FUNDS TO USE PAYSTACK APIS

  async verifyBookingPayment(payment_reference_id: string, charged_amount: number) {
    // const options = {
    //   hostname: 'api.paystack.co',
    //   port: 443,
    //   path: `/transaction/verify/${transaction_ref}`,
    //   method: 'GET',
    //   headers: {
    //     Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
    //     'Content-Type': 'application/json'
    //   }
    // }    
    try {
      let get_booking = await this.databaseManager.findOneDocument(this._bkDb, "payment_reference_id", payment_reference_id)
      
      console.log("GET BOOKING: ", get_booking)
      
      // update the booked_status to successful. 
      if (get_booking !== null) {
        let service_providerId = get_booking.service_provider_info.userId
        // UPDATE MATCHING BOOKING STATUS
        await this.databaseManager.updateProperty(this._bkDb, get_booking._id, "booked_status", {booked_status: "SUCCESSFUL"})
        // SET WALLET BALANCE
        // DEDUCT 5%
        charged_amount = charged_amount / 100
        console.log("Original_Charge_amount:", charged_amount)
        let deduct_service_charge = 5/100 * charged_amount
        charged_amount -= deduct_service_charge
        console.log(JSON.stringify(
          {
            "Deduct_Service_Charge":deduct_service_charge, 
            "New_Charge_amount:": charged_amount
          })
        )
        await this.walletService.increase_wallet_balance(service_providerId, charged_amount)
        
        // SAVE PAYMENT DETAILS TO SERVICE PAYMENTS DATABASE
        // let payment_ref_id = (await this.databaseManager.create(this._pdb, transaction_details)).insertedId
       // await sendPaymentSuccessMail(request.data.customer.email, request.data.meta.consumer_name, request.data.meta.payment_receiver_name, request.data.charged_amount, request.data.meta.service_name )
       return {booking_status: "Success", transaction_ref: get_booking.payment_reference_id, booking_id: get_booking._id }
      }
      throw new BadRequestException({message: ResponseMessages.PaymentNotResolved})
      // } else {
      //   // await paymentFailed(response.data.customer.email, response.data.meta.consumer_name, response.data.meta.payment_receiver_name, response.data.charged_amount, response.data.meta.service_name )
      //   throw new BadRequestException({message: request.data.status, transaction_ref})
      // } 
    } catch (err: any) {
      console.log(err)
      throw new BadRequestException({message: err.message })
    }
  }

  async verifyTransferWebhook() {
    
  }

  async createTransferRecipient(email: string, account_number: string, bank_code: string, name: string) {
    const data = JSON.stringify({
      'type': 'nuban',
      'account_number': `${account_number}`,
      'bank_code': `${bank_code}`,
      'name': `${name}`
    });
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transferrecipient`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      }
    };
    try {
      let response: any = await PaymentsAPI.makeRequest(data, options);
      if (response.status === true) {
        await this.databaseManager.updateArr(this._uWDB, 'email', email, "bank_details", [{
          account_name: response.data.details.account_name,
          account_number: response.data.details.account_number, 
          recipient_code: response.data.recipient_code,
          bank_code: response.data.details.bank_code,
          country: response.data.currency,
          bank_name: response.data.details.bank_name
        }])
      return {bank_details: response.data.details, recipient_code: response.data.recipient_code}
      }
      throw new BadRequestException({message: response.message})
    } catch (err: any) {
      throw new BadRequestException({message: err.message})
    }
  }


  async get_user_subscription_plan(userId: string) {
    let get_user = await this.databaseManager.findOneDocument(this._udb, "_id", userId)
    if (get_user !== null && get_user.payment_details !== undefined) return {subscription_plan : get_user.payment_details.current_plan}
    return {subscription_plan : "Trial"}
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
  
  async create_user_payment_details(userId: string, payment_data: any) {
    let payment_info = {
      payment_date: payment_data.payment_date,
      plan: payment_data.amount === '4200' ? "Monthly" : "Yearly",
      amount: payment_data.amount
    }
    let find_user_billing_history = await this.databaseManager.findOneDocument(this._pdb, "_id", userId)
    if (find_user_billing_history !== null) {
      await this.databaseManager.updateArr(this._pdb, "_id", new ObjectId(userId), "payment_info", [payment_info])
      return ResponseMessages.TransactionRecorded
    }
    await this.databaseManager.create(this._pdb, {"_id": new ObjectId(userId), payment_info: [payment_info]})
    return ResponseMessages.TransactionRecorded
  }


  async get_user_payment_history(userId: any) {
    let user_payments = await this.databaseManager.findOneDocument(this._pdb, "_id", userId)
    return user_payments ? user_payments.payment_info : []
  }
  
  
  static async makeRequest(data: any, options: any) {
    try {
      return new Promise((resolve, reject) => {
        const req = request(options, (res) => {
          let responseData = '';

          res.on('data', (chunk) => {
            responseData += chunk;
          });
          
          res.on('end', () => {
            try {
              const parsedData = JSON.parse(responseData);
              resolve(parsedData);
            } catch (error) {
              reject(new Error('Invalid JSON response'));
            }
          });
        }).on('error', (error) => {
          reject(new BadRequestException({
            statusCode: 400,
            message: error.message
          }));
        });

        req.write(data);
        req.end();
      });
    } catch (err) {
      throw new BadRequestException({ message: err.message });
    }
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


  async generateUniqueTransactionCode(prefix: string): Promise<string> {
  
    const timestamp = Date.now().toString(); // Get current timestamp
    let random_string = await generate_random_string(8)
    let tx_ref = `${prefix}-${timestamp}-${random_string}`;
  
    return tx_ref;
  }
}

// export async function verifyAccountNumber(account_number: string, bank_code: string) {
//   const data = JSON.stringify({
//     'account_number': account_number,
//     'bank_code': bank_code
//   })
//   const options = {
//     hostname: 'api.paystack.co',
//     port: 443,
//     path: `/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
//     method: 'GET',
//     headers: {
//       Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
//       'Content-Type': 'application/json'
//     }
//   };
//   let response: any = await PaymentsAPI.makeRequest(data, options)
//   return response
// };


export async function initiateTransferToUserBank(user: any, amount: number, recipient_code: string, reference: string) {
  const data = JSON.stringify({
    'source': 'balance',
    'amount': amount,
    'recipient': recipient_code,
    'reference': reference,
    'reason':  `${user.userId}`
  })
  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: `/transfer`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
      'Content-Type': 'application/json'
    }
  };
  try {
    let response: any = await PaymentsAPI.makeRequest(data, options)
    return response
  } catch (err: any) {
    throw new BadRequestException({message: err})
  }
};

export async function verifyTransferStatus(transfer_reference_code: string) {}

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

async function generate_transfer_reference_string(length: number) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let i, result= "TRA-REF-";
  for (i = 0; i <= length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result
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