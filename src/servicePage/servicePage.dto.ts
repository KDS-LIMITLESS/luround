import { PickType } from "@nestjs/mapped-types";
import { IS_STRING, IsDate, IsEmail, IsNotEmpty, IsString, isNotEmpty } from "class-validator";

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
  service_page: string

  @IsNotEmpty()
  duration: string

  @IsNotEmpty()
  service_charge_virtual: string

  @IsNotEmpty()
  service_charge_in_person: string

  @IsNotEmpty()
  @IsDate({always: true})
  date: Date

  @IsString()
  @IsNotEmpty()
  id: string
}

export class deleteServiceDto extends PickType(ServicePageDto, ['email', 'service_name'] as const) {}

export class EmailDto extends PickType(ServicePageDto, ['email'] as const) {}

export class IdDto extends PickType(ServicePageDto, ['id'] as const) {}