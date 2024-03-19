import { PickType } from "@nestjs/mapped-types";
import { IsEmail, IsEmpty, IsEnum, IsNotEmpty, IsString, IsOptional } from "class-validator";



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

  @IsEmpty()
  occupation: null
  
  @IsEmpty()
  about: null
  
  @IsEmpty()
  certificates: null

  @IsEmpty()
  media_links: null

  @IsNotEmpty()
  user_nToken: string

}

export class GoogleUserDTO extends PickType(UserDto, ['email', 'firstName', 'lastName', 'photoUrl', 'user_nToken'] as const) {}
