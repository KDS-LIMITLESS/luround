import { PickType } from "@nestjs/mapped-types";
import { File } from "buffer";
import { IsEnum, IsNotEmpty, IsDate, IsOptional, IsMongoId, IsEmail } from "class-validator";
import { ServicePageDto } from "../servicePage/servicePage.dto.js";

enum AppointmentTypes {
  virtual = 'Virtual',
  in_person = 'In-Person'
}

export class BookServiceDto {

  @IsNotEmpty()
  phone_number: string

  displayName: string

  @IsNotEmpty() @IsEnum(AppointmentTypes)
  appointment_type: string

  @IsOptional()
  file? : File

  @IsOptional()
  message: string 

  @IsNotEmpty()
  date: any

  @IsNotEmpty()
  time: string

  @IsNotEmpty()
  duration: string

  @IsNotEmpty()
  location: string

  @IsMongoId()
  @IsOptional()
  bookingId?: string

  @IsEmail() @IsOptional()
  email: string

  @IsOptional()
  user_name: string
} 

export class BookingId extends PickType(BookServiceDto, ['bookingId'] as const) {}

export class ServiceId extends PickType(ServicePageDto, ['serviceId'] as const) {}
