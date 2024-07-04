import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UserWalletDto {

  @IsString()
  @IsOptional()
  account_name: string

  @IsString()
  @IsNotEmpty()
  account_number: string

  @IsString()
  @IsOptional()
  bank_name: string

  @IsNotEmpty()
  bank_code: string

  @IsString()
  @IsNotEmpty()
  country: string

}

export class WithdrawDTO {

  @IsNotEmpty()
  recipient_code: string

  @IsNotEmpty()
  amount: number

  @IsNotEmpty()
  wallet_pin: string

  @IsNotEmpty()
  reference: string

}