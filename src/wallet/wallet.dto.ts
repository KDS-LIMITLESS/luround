import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

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
  amount: string

  @IsNotEmpty()
  wallet_pin: string

  @IsNotEmpty()
  reference: string

  @IsOptional()
  reason: string
}