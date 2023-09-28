import { Injectable, InternalServerErrorException } from "@nestjs/common";
import * as qrc from 'qrcode'
import { DatabaseService } from "src/store/db.service";

@Injectable()
export class QRCodeService {
  constructor(private _db:DatabaseService) {}

  async generateQRCode(email: string) {
    const qrCode = await qrc.toDataURL(email)
    const isUser = await this._db.findOneDocument(email)
    
    if(!qrCode || !isUser) {
      throw new InternalServerErrorException({
        status: 500,
        message: "Error generating QRCode"
      })
    }
    return Buffer.from(qrCode.replace(/^data:image\/png;base64,/, ''), "base64")
  }
}