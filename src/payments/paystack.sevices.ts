import { BadRequestException, Injectable } from "@nestjs/common";
import { request } from "https";
import got from "got";

import Flutterwave from 'flutterwave-node-v3';

const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY)


@Injectable()
export class PaystackAPI {
  constructor() {}

  static async initializePayment(email: string, amount: string): Promise<any> {
    const data = JSON.stringify({
      'email': email,
      'amount': amount
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
  
  static async verifyPayment(transaction_ref: string) {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/:${transaction_ref}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      }
    }
    console.log(options)
    return await this.makeRequest(transaction_ref, options)
  }

  
  static makeRequest(data: any, options: {}) {
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

  static async initiate_flw_payment(amount: string, req: any, phone_number: string) {
    let tx_ref = await generateUniqueTransactionCode("LUROUND")
    try {
      const response = await got.post("https://api.flutterwave.com/v3/payments", {
        headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
        },
        json: {
          tx_ref: tx_ref,
          amount: amount,
          currency: "NGN",
          redirect_url: `http://localhost:3000/api/v1/verify-flw-payment?status=`,
          meta: {
              consumer_id: req.userId
          },
          customer: {
              email: req.email,
              phonenumber: phone_number,
              name: req.name
          },
          customizations: {
              title: "Luround Pay",
              logo: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png"
          }
        }
      }).json()
    return response
  } catch (err) {
      throw new BadRequestException({ message: err.message})
    }
  }

// 4722335
  static async verify_flw_payment(req: any ) {
    if (req.query.status === 'successful') {
      const transactionDetails = await flw.Transaction.find({ref: req.tx_ref});
      const response = await flw.Transaction.verify({id: req.transaction_id});
    if (
        response.data.status === "successful"
        && response.data.amount === transactionDetails.amount
        && response.data.currency === "NGN") {
        return "Payment Successful"
    } else {
        // Inform the customer their payment was unsuccessful
        throw new Error("Payment not Successfull")
      }
    }
  }

}

// uninvited guest

async function generateUniqueTransactionCode(prefix: string): Promise<string> {
  
  const timestamp = Date.now().toString(); // Get current timestamp
  let random_string = await generate_random_string(8)
  let tx_ref = `${prefix}-${timestamp}-${random_string}`;

  return tx_ref;
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