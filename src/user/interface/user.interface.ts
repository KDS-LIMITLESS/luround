import { Request } from "express";

export interface IUser {
  email: string,
  firstName: string,
  lastName:string,
  picture: string,
  password?: string
  accountCreatedFrom: string
}

export interface IRequest<U = any> extends Request {
  user?: U
}