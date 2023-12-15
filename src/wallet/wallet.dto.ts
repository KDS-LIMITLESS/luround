import { IsNotEmpty, IsNumber, IsString } from "class-validator";

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

export class WithdrawDTO {
  @IsNotEmpty()
  account_bank: string

  @IsNotEmpty()
  account_number: string

  @IsNotEmpty()
  amount: number

  @IsNotEmpty()
  wallet_pin: string
}