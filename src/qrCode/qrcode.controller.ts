import { Controller, Get, HttpStatus, Query, Req, Res } from "@nestjs/common";
import { QRCodeService } from "./qrcode.service.js";
import { Response } from "express";
import { QRCodeDTO } from "./qrcode.dto.js";
import { SkipAuth } from "../auth/jwt.strategy.js";

@Controller('api/v1/qrcode')
export class QRCodeController {
  
  constructor(private qrcodeService: QRCodeService) {}

  @SkipAuth()
  @Get('/generate')
  async generateUserQRCode(@Req() req, @Res() res: Response, @Query() query) {
    res.setHeader('Content-Type', 'image/png');
    return res
    .status(HttpStatus.OK)
    .json(await this.qrcodeService.generate_qrcode(query.url))
  }
}