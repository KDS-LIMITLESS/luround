import { Body, Controller, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { WalletService } from "./wallet.services.js";
import { UserWalletDto } from "./wallet.dto.js";


@Controller('api/v1/wallet')
export class WalletController {
  constructor (private walletManager: WalletService) {}

  @Post('add-bank-details')
  async addBankDetails(@Req() req, @Res() res, @Body() payload: UserWalletDto ) {
    return res.status(HttpStatus.OK).json(await this.walletManager.add_bank_details(req.user, payload))
  }

  @Post('create-wallet-pin')
  async createWalletPin(@Req() req, @Res() res, @Body() payload) {
    return res.status(HttpStatus.OK).json(await this.walletManager.create_wallet_pin(req.user.userId, payload.wallet_pin))
  }

  @Post('verify-wallet-pin')
  async verifyWalletPin(@Req() req, @Res() res, @Body() payload) {
    return res.status(HttpStatus.OK).json(await this.walletManager.verify_wallet_pin(req.user.userId, payload.wallet_pin))
  }
}