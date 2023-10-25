import { IsDate, IsEmail, IsNotEmpty, IsNumber } from "class-validator";
import { PartialType, PickType } from '@nestjs/mapped-types'


export class userProfileMainDto{
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  password: string

  @IsNotEmpty()
  displayName: string

  @IsNotEmpty()
  photoUrl: string

  @IsNotEmpty()
  occupation: string
  
  @IsNotEmpty()
  about: string
  
  @IsNotEmpty()
  certificates: Array<{[key: string]: any}>

  @IsNotEmpty()
  media_links: Array<{[key: string]: any}>

  @IsNotEmpty()
  slug: string

  @IsNotEmpty()
  url: string
}

export class CertificateValidationDto {
  @IsEmail()
  email: string

  @IsNotEmpty()
  certificateName: string

  @IsNotEmpty()
  issuingOrganization: string

  @IsNotEmpty() @IsDate()
  issueDate: Date

  @IsNumber({allowNaN: false})
  certificateID: number
}


export class userProfileDto extends PartialType(userProfileMainDto) {}

