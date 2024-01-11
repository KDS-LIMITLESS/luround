import { BadRequestException } from "@nestjs/common";
import { IsArray, IsDate, IsEmail, IsNotEmpty, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from "class-validator";

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

export class QuotesDto {

  @IsNotEmpty()
  phone_number: string

  @IsNotEmpty()
  due_date: Date

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
  duration: string

  @IsNotEmpty()
  appointment_type: string
}

export class EmailDto {
  @IsEmail() @IsNotEmpty()
  service_provider_email: string
}
