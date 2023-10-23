import { Controller, Get, HttpStatus, Post, Put, Query, Req, Res } from "@nestjs/common";
import { QRCodeService } from "./qrcode.service";
import { Response } from "express";
import { QRCodeDTO } from "./qrcode.dto";

@Controller('api/v1/qrcode')
export class QRCodeController {
  
  constructor(private qrcodeService: QRCodeService) {}

  @Get('/generate')
  async generateUserQRCode(@Res() res: Response, @Query() query: QRCodeDTO) {
    res.setHeader('Content-Type', 'image/png');
    return res
    .status(HttpStatus.OK)
    .json(await this.qrcodeService.generate_qrcode(query.email))
  }
}