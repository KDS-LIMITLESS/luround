import { Controller, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { QRCodeService } from "./qrcode.service";
import { Request, Response } from "express";

@Controller('api/v1/users/qrcode')
export class QRCodeController {
  constructor(private qrcodeService: QRCodeService) {}

  @Post('/generate')
  async generateUserQRCode(@Req() req: Request, @Res() res: Response) {
    res.setHeader('Content-Type', 'image/png');
    return res
    .status(HttpStatus.OK)
    .json(await this.qrcodeService.generateQRCode(req.body.email))
  }
}