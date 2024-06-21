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

  @IsNotEmpty()
  service_fee: string

  @IsOptional()
  appointment_buffer: string

  @IsOptional()
  duration: string

  @IsOptional()
  booking_period: string

  @IsOptional()
  notice_period: string

  @IsOptional()
  stop_time: string

  @IsMongoId()
  @IsOptional()
  serviceId: string

  @IsNotEmpty()
  @IsEnum(SERVICE_TYPE)
  service_type: string

  @IsOptional()
  service_recurrence: string

  // @IsOptional()
  // time_allocation: string

  // @IsOptional()
  // virtual_pricing: string

  // @IsOptional()
  // in_person_pricing: string
  @IsOptional()
  virtual_event_fee: string

  @IsOptional()
  date: string

  @IsOptional()
  in_person_event_fee: string

  @IsOptional()
  @IsArray()
  core_features: []

  @IsOptional()
  physical_location: string

  @IsOptional()
  event_type: string

  @IsOptional()
  start_time: string

  @IsOptional()
  end_time: string



  // @IsOptional()
  // event_schedule_date: string

  // @IsOptional()
  // event_schedule_time: string

  // @IsOptional()
  // event_schedule_end_time: string
 
  @IsOptional()
  max_number_of_participants: number

  @IsOptional()
  start_date: string

  @IsOptional()
  virtual_meeting_link: string

  @IsOptional()
  end_date: string

  @IsOptional()
  pricing: any

  @IsOptional()
  availability_schedule: any

  @IsOptional()
  event_schedule: any

  @IsOptional()
  appointment_time: string

}

export class ServiceDto extends PartialType(ServicePageDto) {}
export class ServiceTypeDTO extends PickType(ServicePageDto, ['service_type'] as const) {}