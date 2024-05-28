import { PartialType, PickType } from "@nestjs/mapped-types";
import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

enum SERVICE_TYPE {
  program = 'Program',
  one_off = 'One-Off',
  retainer = 'Retainer',
  event = 'Event'
}

enum SERVICE_STATUS{
  active = "ACTIVE",
  suspended = "SUSPENDED"
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
  appointment_buffer: string

  @IsOptional()
  duration: string

  @IsOptional()
  booking_period: string

  @IsOptional()
  notice_period: string

  // @IsOptional()
  // service_charge_virtual: string

  // @IsOptional()
  // service_charge_in_person: string

  @IsMongoId()
  @IsOptional()
  serviceId: string

  // @IsOptional()
  // time: string

  // @IsOptional()
  // date: string

  // @IsOptional()
  // available_days: string

  // @IsOptional()
  // @IsArray()
  // available_time: []

  @IsNotEmpty()
  @IsEnum(SERVICE_TYPE)
  service_type: string

  // @IsOptional() 
  // @IsEnum(ServiceModels)
  // service_model: string

  @IsOptional()
  service_recurrence: string

  @IsOptional()
  pricing: [{[key: string]: string}]

  // @IsOptional()
  // timeline_days: []

  @IsOptional()
  max_number_of_participants: number

  // @IsOptional()
  // service_timeline: string

  @IsOptional()services
  start_date: string

  @IsOptional()
  virtual_meeting_link: string
  
  @IsOptional()
  availability_schedule: [{[key:string]: string}]

  @IsOptional()
  program_fee: [{[key:string]: string}]

  @IsOptional()
  event_schedule: [{[key:string]: string}]

  @IsOptional()
  end_date: string

  // @IsOptional()
  // start_time: string

  // @IsOptional()
  // end_time: string
}

export class ServiceDto extends PartialType(ServicePageDto) {}
export class ServiceTypeDTO extends PickType(ServicePageDto, ['service_type'] as const) {}