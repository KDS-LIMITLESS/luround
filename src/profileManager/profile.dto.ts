import { Contains, IsArray, IsDate, IsEmail, IsNotEmpty, IsNumber, ValidationArguments, 
  ValidationOptions, 
  ValidatorConstraint, ValidatorConstraintInterface, registerDecorator 
} from "class-validator";
import { PartialType, PickType } from '@nestjs/mapped-types'
import { BadRequestException } from "@nestjs/common";


@ValidatorConstraint({async: true})
export class IsCertificateConstraint implements ValidatorConstraintInterface {
  validate(certificates: any, args: ValidationArguments): boolean {
    try {
      if (Array.isArray(certificates)) {

        let  certificateName, issuingOrganization, issueDate, validateCertificate, date;
        certificates.forEach(function(certObj) {
          certificateName = Object.getOwnPropertyDescriptor(certObj, 'certificateName').value
          issuingOrganization = Object.getOwnPropertyDescriptor(certObj, 'issuingOrganization').value
          issueDate = Object.getOwnPropertyDescriptor(certObj, 'issueDate').value
          
          date = new Date(issueDate)
          if(date.toString() === "Invalid Date") throw Error("issueDate must be a date object. YYYY-MM ")

          if((certificateName && issuingOrganization && issueDate) !== '' &&
            (certificateName && issuingOrganization && issueDate) !== null &&
            (certificateName && issuingOrganization && issueDate) !==undefined) 
          { validateCertificate = true } 
          else { 
            validateCertificate = false; 
            throw Error('certificateName and issuingOrganization fields must not be empty') 
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
  
  @IsCertificate()
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


}


export class userProfileDto extends PartialType(userProfileMainDto) {}

