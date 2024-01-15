import { IsEmail, IsNotEmpty, } from "class-validator";



export class ContactDTO {

  @IsNotEmpty()
  name: string

  @IsNotEmpty() @IsEmail()
  email: string

  @IsNotEmpty()
  phone_number: string

}