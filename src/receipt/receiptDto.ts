import { BadRequestException } from "@nestjs/common";
import { PartialType } from "@nestjs/mapped-types";
import { IsArray, IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from "class-validator";

@ValidatorConstraint({async: true})
class ReceiptDetailConstraint implements ValidatorConstraintInterface {
  validate(product_detail: any, validationArguments?: ValidationArguments): boolean | Promise<boolean> {

    if (Array.isArray(product_detail)) { 
      let validateProduct = true; 
    
      product_detail.forEach(function(obj) {
        // Check if all required properties are present and not empty
        const requiredProperties = ["service_name", "appointment_type", "rate", "duration", "discount", "total"];
        const hasAllProperties = requiredProperties.every(prop => prop in obj );
    
        if (hasAllProperties) {
          // If all required properties are present, set the created_at property to the current timestamp
          Object.defineProperty(obj, "created_at", {value: Date.now()});
        } else {
          validateProduct = false;
          throw new BadRequestException({
            message: "service_name, appointment_type, rate, duration, discount, total, fields must not be empty"
          });
        }
      });
      return validateProduct
    } 
    throw new BadRequestException({ message: "product_detail must be an array"})
  }
}

function IsValidReceiptServiceData(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ReceiptDetailConstraint
    });
  }
}

enum ReceiptStatus {
  draft = "DRAFT",
  sent = "SENT"
}

export class ReceiptDto {

  @IsNotEmpty()
  send_to_name: string

  @IsNotEmpty() @IsEmail()
  send_to_email: string

  @IsNotEmpty()
  phone_number: string

  @IsNotEmpty() @IsEnum(ReceiptStatus)
  payment_status: string

  @IsArray() @IsValidReceiptServiceData()
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
  mode_of_payment: string

  @IsNotEmpty()
  receipt_date: any

  @IsOptional()
  note: any
}

export class ReceiptPartialDTO extends PartialType(ReceiptDto) {}