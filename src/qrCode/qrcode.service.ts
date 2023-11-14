import { Injectable, InternalServerErrorException } from "@nestjs/common";
import * as qrc from 'qrcode'
import ResponseMessages from "../messageConstants.js";
import { DatabaseService } from "../store/db.service.js";

@Injectable()
export class QRCodeService {
  _qrcDB =this.qrcodeManager.userDB
  constructor(private qrcodeManager:DatabaseService) {}

  async generate_qrcode(email: string): Promise<Buffer> {
    const qrCode = await qrc.toDataURL(email)
    const isUser = await this.qrcodeManager.read(this._qrcDB, email)
    
    if(!qrCode || !isUser) {
      throw new InternalServerErrorException({
        status: 500,
        message: ResponseMessages.QRCodeError
      })
    }
    return Buffer.from(qrCode.replace(/^data:image\/png;base64,/, ''), "base64")
  }
}
