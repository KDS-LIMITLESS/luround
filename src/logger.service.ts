import { HttpException, HttpStatus, Logger, Injectable } from "@nestjs/common";

@Injectable()
export class ResponseData {
  responseCode: number
  responseMessage: String
  errorMessage: String
  
}