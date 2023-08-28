import { HttpException, HttpStatus, Logger, Injectable } from "@nestjs/common";

@Injectable()
export class ResponseData {
  
  private static responseObject: Record<string,any>

  /**
   * 
   * @code Valid HTTP status code  
   * @message Custom message for the client
   * @payload Respnse data to send to client
   * @err Error in request
   */

  static log(code: HttpStatus, message: string, 
    payload?:string, err?: HttpException): void 
  {
    this.responseObject = { code, message, payload, err }
    return Logger.log(this.responseObject)
  }
}



