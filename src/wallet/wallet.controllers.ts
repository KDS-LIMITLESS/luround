import { Body, Controller, Get, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { WalletService } from "./wallet.services.js";
import { UserWalletDto } from "./wallet.dto.js";
import got from "got";
import { SkipAuth } from "../auth/jwt.strategy.js";


@Controller('api/v1/wallet')
export class WalletController {
  constructor (private walletManager: WalletService) {}

  @Post('add-bank-details')
  async addBankDetails(@Req() req, @Res() res, @Body() payload: UserWalletDto ) {
    return res.status(HttpStatus.OK).json(await this.walletManager.add_bank_details(req.user, payload))
  }

  @Post('create-wallet-pin')
  async createWalletPin(@Req() req, @Res() res, @Body() payload) {
    return res.status(HttpStatus.OK).json(await this.walletManager.create_wallet(req.user.userId, payload.wallet_pin))
  }

  @Post('verify-wallet-pin')
  async verifyWalletPin(@Req() req, @Res() res, @Body() payload) {
    return res.status(HttpStatus.OK).json(await this.walletManager.verify_wallet_pin(req.user.userId, payload.wallet_pin))
  }

  @SkipAuth()
  @Get('get-banks')
  async getBanks(@Req() req, @Res() res) {
    const response = await got.get('https://api.flutterwave.com/v3/banks/NG', {
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
      },
    })
    return res.status(HttpStatus.OK).json(JSON.parse(response.body))
  }

  @Get('balance')
  async getWalletBalance(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.walletManager.get_wallet_balance(req.user.userId))
  }
}