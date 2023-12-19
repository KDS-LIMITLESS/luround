import { IsNotEmpty } from "class-validator";

export class FeedBackDto {

  @IsNotEmpty()
  Subject: string

  @IsNotEmpty()
  Description: string
}