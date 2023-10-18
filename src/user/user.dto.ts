import { IsEmail, IsEmpty, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { PickType } from '@nestjs/mapped-types'


export enum AccountCreatedFrom {
  Google = 'GOOGLE',
  Local = 'LOCAL'
}

export class createUserDto{
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  password: string

  @IsNotEmpty()
  displayName: string

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

export class loginUserDto extends PickType(createUserDto, ['email', 'password'] as const) {}
