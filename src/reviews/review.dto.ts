import { PartialType, PickType } from "@nestjs/mapped-types";
import { IsMongoId, IsNotEmpty, IsNumber } from "class-validator";

export class ReviewDTO {

  @IsNotEmpty()
  comment: string

  @IsNotEmpty() @IsNumber()
  rating: number

  @IsNotEmpty()
  @IsMongoId()
  serviceId: string
}

export class ReviewPickDTO extends PickType(ReviewDTO, ['comment', 'rating'] as const) {}
export class ReviewPickServiceIdDTO extends PickType(ReviewDTO, ['serviceId']) {}