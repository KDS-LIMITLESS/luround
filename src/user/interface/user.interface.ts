import { Request } from "express";

export interface IGoogleAccount {
  email: string,
  firstName: string,
  lastName:string,
  picture: string,
  accountCreatedFrom: string
}

export interface IRequest<U = any> extends Request {
  user?: U
}