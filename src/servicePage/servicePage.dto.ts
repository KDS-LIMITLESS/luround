import { PartialType } from "@nestjs/mapped-types";
import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional } from "class-validator";


export class ServicePageDto{

  @IsNotEmpty()
  service_name: string

  @IsNotEmpty()
  description: string

  @IsOptional()
  links: string

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
}

export class ServiceDto extends PartialType(ServicePageDto) {}