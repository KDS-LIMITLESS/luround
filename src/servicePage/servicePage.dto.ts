import { PartialType } from "@nestjs/mapped-types";
import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

enum ServiceType {
  program = 'PROGRAM SERVICE',
  regular = 'REGULAR SERVICE',
  package = 'PACKAGE SERVICE'
}

enum ServiceModels {
  one_off = 'ONE-OFF',
  retainer = 'RETAINER'
}


export class ServicePageDto{

  @IsNotEmpty()
  service_name: string

  @IsNotEmpty()
  description: string

  @IsOptional()
  links: [string]

  @IsNotEmpty()
  duration: string

  @IsOptional()
  service_charge_virtual: string

  @IsOptional()
  service_charge_in_person: string

  @IsMongoId()
  @IsOptional()
  serviceId: string

  @IsNotEmpty()
  time: string

  @IsNotEmpty()
  date: string

  @IsNotEmpty()
  available_days: string

  @IsNotEmpty()
  @IsArray()
  available_time: []

  @IsNotEmpty()
  @IsEnum(ServiceType)
  service_type: string

  @IsOptional() 
  @IsEnum(ServiceModels)
  service_model: string

  @IsOptional()
  service_recurrence: string

  @IsOptional()
  max_number_of_participants: number
}

export class ServiceDto extends PartialType(ServicePageDto) {}