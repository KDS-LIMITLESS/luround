import { IsEmail, IsEmpty, IsEnum, IsNotEmpty, IsString, IsOptional } from "class-validator";


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

  @IsOptional()
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

  user_nToken: string

}
