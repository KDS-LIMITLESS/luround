import { Contains, IsArray, IsDate, IsEmail, IsNotEmpty, IsNumber, IsOptional, ValidationArguments, 
  ValidationOptions, 
  ValidatorConstraint, ValidatorConstraintInterface, registerDecorator 
} from "class-validator";
import { PartialType } from '@nestjs/mapped-types'
import { BadRequestException } from "@nestjs/common";


@ValidatorConstraint({async: true})
export class IsCertificateConstraint implements ValidatorConstraintInterface {
  validate(certificates: any, args: ValidationArguments): boolean | Promise<boolean> {
    try {
      if (Array.isArray(certificates)) {
        // console.log(certificates)
        let  certificateName, issuingOrganization, issueDate, validateCertificate;
        certificates.forEach(function(certObj) {
          certificateName = Object.getOwnPropertyDescriptor(certObj, 'certificateName')?.value
          issuingOrganization = Object.getOwnPropertyDescriptor(certObj, 'issuingOrganization')?.value
          issueDate = Object.getOwnPropertyDescriptor(certObj, 'issueDate')?.value
          
          // date = new Date(issueDate)
          // if(date.toString() === "Invalid Date") throw Error("issueDate must be a date object. YYYY-MM ")

          if((certificateName && issuingOrganization && issueDate) !== '' &&
            (certificateName && issuingOrganization && issueDate) !== null &&
            (certificateName && issuingOrganization && issueDate) !==undefined) 
          { validateCertificate = true } 
          else { 
            validateCertificate = false; 
            throw Error('certificateName, issuingOrganization and issueDate fields must not be empty or undefined') 
          }
        })
        return validateCertificate
      }
      throw Error("Certificates must be an array")
    }
    catch (e: any) {
      throw new BadRequestException({
        message: e.message
      })
    }
    
  }
}

@ValidatorConstraint({async: true})
export class IsValidLinkPayloadConstraint implements ValidatorConstraintInterface {
  validate(media_links: any, args: ValidationArguments): boolean | Promise<boolean> {
    try{
      if (Array.isArray(media_links)) {
        let name: string, icon:string, link: string, validateLinkPayload: boolean;

        media_links.forEach(function(m_link) {
          name = Object.getOwnPropertyDescriptor(m_link, "name")?.value
          icon = Object.getOwnPropertyDescriptor(m_link, "icon")?.value
          link = Object.getOwnPropertyDescriptor(m_link, "link")?.value

          if ((name && icon && link) !== undefined && (name && icon && link) !== null) {
            validateLinkPayload = true
          } else {
            validateLinkPayload = false
            throw Error("link, name and icon fields must not be null or undefined")
          }
        })
        return validateLinkPayload
      }
      throw Error("media_links must must be an array")
    } 
    catch(err: any) {
      throw new BadRequestException({
        message: err.message
      })
    }
  } 
}

export function IsCertificate(validtionOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validtionOptions,
      constraints: [],
      validator: IsCertificateConstraint,
    });
  }
}

export function IsValidLinKPayload(validtionOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validtionOptions,
      constraints: [],
      validator: IsValidLinkPayloadConstraint,
    });
  }
}

export class userProfileMainDto{
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  password: string

  @IsOptional()
  firstName: string

  @IsOptional()
  lastName: string

  @IsOptional()
  photoUrl: string

  @IsOptional()
  occupation: string

  @IsOptional()
  company: string
  
  @IsOptional()
  about: string
  
  @IsOptional()
  certificates: Array<{[key: string]: any}>

  @IsValidLinKPayload()
  media_links: Array<{[key: string]: any}>

  @IsOptional()
  slug: string

  @IsOptional()
  url: string

  @IsOptional()
  logo_url: string
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


}


export class userProfileDto extends PartialType(userProfileMainDto) {}

