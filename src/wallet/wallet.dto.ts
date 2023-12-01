import { IsNotEmpty, IsString } from "class-validator";

export class UserWalletDto {

  @IsString()
  @IsNotEmpty()
  account_name: string

  @IsString()
  @IsNotEmpty()
  account_number: string

  @IsString()
  @IsNotEmpty()
  bank_name: string

  @IsString()
  @IsNotEmpty()
  country: string

}