import { IsEmail, IsEmpty, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { PartialType, PickType } from '@nestjs/mapped-types'



export class userProfileDto{
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


export class certificatesDto extends PickType(userProfileDto, ['email', 'certificates'] as const) {}

export class media_linksDto extends PickType(userProfileDto, ['email', 'media_links'] as const) {}

export class displayNameDto extends PickType(userProfileDto, ['email', 'displayName'] as const ) {}

export class occupationDto extends PickType(userProfileDto, ['email', 'occupation'] as const) {}

export class aboutDto extends PickType(userProfileDto, ['email', 'about'] as const ) {}

export class customURLDto extends PickType(userProfileDto, ['email', 'slug']as const ) {}

export class emailDto extends PickType(userProfileDto, ['email'] as const) {}

export class urlDto extends PickType(userProfileDto, ['url']as const ) {}

