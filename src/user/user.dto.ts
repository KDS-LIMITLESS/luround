import { IsEmail, IsEmpty, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { PickType } from '@nestjs/mapped-types'


export enum AccountCreatedFrom {
  Google = 'GOOGLE',
  Local = 'LOCAL'
}

export class UserDto{
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  password: string

  @IsNotEmpty()
  firstName: string

  @IsNotEmpty()
  lastName: string

  @IsNotEmpty()
  photoUrl: string

  @IsNotEmpty() @IsString()
  @IsEnum(AccountCreatedFrom)
  readonly accountCreatedFrom: string

  @IsEmpty()
  occupation: null
  
  @IsEmpty()
  about: null
  
  @IsEmpty()
  certificates: null

  @IsEmpty()
  media_links: null

}
