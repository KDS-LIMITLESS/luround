import { PickType } from "@nestjs/mapped-types";
import { File } from "buffer";
import { IsEnum, IsNotEmpty, IsDate, IsOptional, IsMongoId } from "class-validator";
import { ServicePageDto } from "src/servicePage/servicePage.dto";

enum AppointmentTypes {
  virtual = 'Virtual',
  in_person = 'In-Person'
}

export class BookServiceDto {

  @IsNotEmpty()
  service_receiver_names: string

  @IsNotEmpty()
  service_receiver_email: string

  @IsNotEmpty()
  phone_number: string

  @IsNotEmpty() @IsEnum(AppointmentTypes)
  appointment_type: string

  @IsOptional()
  file? : File

  @IsOptional()
  message: string 

  @IsNotEmpty()
  date: Date

  @IsNotEmpty()
  time: string

  @IsNotEmpty()
  duration: string

  @IsMongoId()
  @IsOptional()
  bookingId: string
} 

export class BookingId extends PickType(BookServiceDto, ['bookingId'] as const) {}

export class ServiceId extends PickType(ServicePageDto, ['serviceId'] as const) {}
