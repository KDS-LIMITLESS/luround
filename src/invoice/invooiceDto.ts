import { BadRequestException } from "@nestjs/common";
import { IsArray, IsDate, IsEmail, IsNotEmpty, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from "class-validator";

@ValidatorConstraint({async: true})
class InvoiceDetailConstraint implements ValidatorConstraintInterface {
  validate(booking_detail: any, validationArguments?: ValidationArguments): boolean | Promise<boolean> {
    // if (Array.isArray(booking_detail)) {
    //   let validateProduct 
    //   booking_detail.forEach(function(obj) {
    //     if ("serviceID" in obj && "appointment_type" in obj && "description" in obj &&
    //      "rate" in obj && "duration" in obj && "discount" in obj && "total" in obj && 
    //      "phone_number" in obj && "date" in obj && "time" in obj && "location" in obj && "message" in obj) 
    //      {
    //       validateProduct = true
    //       Object.defineProperty(obj, "created_at", Date.now())
    //     } else {
    //       validateProduct = false
    //       throw new BadRequestException({message: "appointment_type, location, message, description, rate, duration, discount, phone_number total fields must not be empty"})
    //     }
    //   })
    //   return validateProduct
    // }
    // throw new BadRequestException({ message: "booking_detail must be an array"})

    if (Array.isArray(booking_detail)) { 
      let validateProduct = true;  // Assume all objects are valid initially
    
      booking_detail.forEach(function(obj) {
        // Check if all required properties are present and not empty
        const requiredProperties = ["serviceID", "appointment_type", "description", "rate", "duration", "discount", "total", "phone_number", "date", "time", "location", "message"];
        const hasAllProperties = requiredProperties.every(prop => prop in obj );
    
        if (hasAllProperties) {
          // If all required properties are present, set the created_at property to the current timestamp
          Object.defineProperty(obj, "created_at", {value: Date.now()});
        } else {
          validateProduct = false;
          throw new BadRequestException({
            message: "serviceID, appointment_type, location, message, description, rate, duration, discount, phone_number total, fields must not be empty"
          });
        }
      });
      return validateProduct
    } 
    throw new BadRequestException({ message: "booking_detail must be an array"})
  }
}

function IsValidBookingData(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: InvoiceDetailConstraint
    });
  }
}


export class InvoiceDto {

  @IsNotEmpty()
  send_to: string

  @IsNotEmpty() @IsEmail()
  send_to_email: string

  @IsNotEmpty()
  phone_number: string

  @IsNotEmpty()
  due_date: Date

  @IsArray() @IsValidBookingData()
  booking_detail: []

  @IsNotEmpty()
  sub_total: string

  @IsNotEmpty()
  discount: string

  @IsNotEmpty()
  vat: string

  @IsNotEmpty()
  total: string
}

export class EmailDto {
  @IsEmail() @IsNotEmpty()
  service_provider_email: string
}
