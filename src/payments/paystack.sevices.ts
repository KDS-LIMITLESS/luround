import { BadRequestException, Injectable } from "@nestjs/common";
import { request } from "https";

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
}

