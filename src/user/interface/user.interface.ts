import * as e from "express";

export interface IUser {
  email: string,
  displayName: string,
  photoUrl: string
  password?: string
  accountCreatedFrom: string
  occupation: string,
  about: string
  certificates: any
  media_links: any
  firstName?: string
  lastName?: string
}

export interface IRequest<U = any > extends e.Request {
  user?: U
  query: {email: any}
}