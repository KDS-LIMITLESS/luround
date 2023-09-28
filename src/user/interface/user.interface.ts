import * as e from "express";

export interface IUser {
  email: string,
  firstName: string,
  lastName:string,
  picture: string,
  password?: string
  accountCreatedFrom: string
}

export interface IRequest<U = any > extends e.Request {
  user?: U
  query: {email: any}
}