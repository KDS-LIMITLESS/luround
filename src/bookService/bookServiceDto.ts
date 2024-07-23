import { PickType } from "@nestjs/mapped-types";
import { File } from "buffer";
import { IsEnum, IsNotEmpty, IsDate, IsOptional, IsMongoId, IsEmail } from "class-validator";
import { ServicePageDto } from "../servicePage/servicePage.dto.js";

enum AppointmentTypes {
  virtual = 'Virtual',
  in_person = 'In-Person'
}
export enum BookingGeneratedFromInvoice {
  true = "True",
  false = "False"
}

export class BookServiceDto {

  @IsOptional()
  phone_number: string

  @IsNotEmpty()
  payment_reference: string
  
  displayName: string

  @IsOptional() @IsEnum(AppointmentTypes)
  appointment_type: string

  @IsOptional()
  service_type: string

  @IsOptional()
  document: string

  @IsOptional()
  service_fee : string

  @IsOptional()
  message: string 

  @IsOptional()
  date: any

  @IsOptional()
  time: string

  @IsOptional()
  duration: string

  @IsOptional()
  location: string

  @IsMongoId()
  @IsOptional()
  bookingId?: string

  @IsEmail() @IsOptional()
  email: string

  @IsOptional()
  user_name: string

  @IsOptional()
  total: string

  @IsOptional()
  start_time: string

  @IsOptional()
  end_time: string

} 

export class BookingId extends PickType(BookServiceDto, ['bookingId'] as const) {}

export class ServiceId extends PickType(ServicePageDto, ['serviceId'] as const) {}
