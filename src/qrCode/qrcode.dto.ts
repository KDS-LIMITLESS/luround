import { IsEmail } from "class-validator";

export class QRCodeDTO {
  @IsEmail()
  email: string
}