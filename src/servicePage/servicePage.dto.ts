import { PartialType } from "@nestjs/mapped-types";
import { IsDate, IsEmail, IsMongoId, IsNotEmpty } from "class-validator";

export class ServicePageDto{
  @IsEmail()
  email: string

  @IsNotEmpty()
  service_name: string

  @IsNotEmpty()
  description: string

  @IsNotEmpty()
  links: string

  @IsNotEmpty()
  duration: string

  @IsNotEmpty()
  service_charge_virtual: string

  @IsNotEmpty()
  service_charge_in_person: string

  @IsNotEmpty()
  @IsDate({always: true})
  date: Date

  @IsMongoId()
  @IsNotEmpty()
  serviceId: string
}

export class ServiceDto extends PartialType(ServicePageDto) {}