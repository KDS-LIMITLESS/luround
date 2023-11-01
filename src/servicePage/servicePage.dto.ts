import { PartialType } from "@nestjs/mapped-types";
import { IsMongoId, IsNotEmpty, IsOptional } from "class-validator";

export class ServicePageDto{
  @IsOptional()
  email: string

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

  // add enum of the types
  @IsNotEmpty()
  schedule_type: string

  @IsMongoId()
  @IsOptional()
  serviceId: string
}

export class ServiceDto extends PartialType(ServicePageDto) {}