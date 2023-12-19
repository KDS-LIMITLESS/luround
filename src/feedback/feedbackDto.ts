import { IsNotEmpty } from "class-validator";

export class FeedBackDto {

  @IsNotEmpty()
  subject: string

  @IsNotEmpty()
  description: string
}