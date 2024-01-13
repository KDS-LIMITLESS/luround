import { BadRequestException } from "@nestjs/common";
import { PartialType } from "@nestjs/mapped-types";
import { IsArray, IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from "class-validator";

@ValidatorConstraint({async: true})
class ProductDetailConstraint implements ValidatorConstraintInterface {
  validate(product_detail: any, validationArguments?: ValidationArguments): boolean | Promise<boolean> {
    if (Array.isArray(product_detail)) {
      let validateProduct 
      product_detail.forEach(function(obj) {
        if ("service_name" in obj && "meeting_type" in obj && "description" in obj && "rate" in obj && "duration" in obj && "discount" in obj && "total" in obj) {
          validateProduct = true
        } else {
          validateProduct = false
          throw new BadRequestException({message: "service_name, meeting_type, description, rate, duration, discount total fields must not be empty"})
        }
      })
      return validateProduct
    }
    throw new BadRequestException({ message: "product_detail must be an array"})
  } 
}

function IsProduct(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ProductDetailConstraint
    });
  }
}

enum AppointmentTypes {
  virtual = 'Virtual',
  in_person = 'In-Person'
}


enum Status {
  sent = 'SENT',
  saved = 'SAVED'
}


export class QuotesDto {

  @IsNotEmpty()
  send_to_name: string

  @IsNotEmpty()
  send_to_email: string

  @IsNotEmpty()
  phone_number: string

  @IsNotEmpty()
  due_date: Date

  @IsNotEmpty()
  quote_date: any

  @IsArray() @IsProduct()
  product_detail: []

  @IsNotEmpty()
  sub_total: string

  @IsNotEmpty()
  discount: string

  @IsNotEmpty()
  vat: string

  @IsNotEmpty()
  total: string

  @IsNotEmpty()
  appointment_type: string

  @IsOptional()
  note: string

  @IsNotEmpty() @IsEnum(Status)
  status: string
}


export class RequestQuoteDto {
  @IsNotEmpty() @IsEmail()
  user_email: string

  @IsNotEmpty()
  full_name: string

  @IsNotEmpty()
  phone_number: string

  @IsNotEmpty() @IsEnum(AppointmentTypes)
  appointment_type: string

  @IsOptional()
  note: string
}

export class QuotesOptionalDto extends PartialType(QuotesDto) {}