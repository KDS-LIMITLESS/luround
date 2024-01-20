import { Injectable, InternalServerErrorException } from "@nestjs/common";
import * as qrc from 'qrcode'
import ResponseMessages from "../messageConstants.js";
import { DatabaseService } from "../store/db.service.js";

@Injectable()
export class QRCodeService {
  _qrcDB = this.qrcodeManager.userDB
  constructor(private qrcodeManager:DatabaseService) {}

  async generate_qrcode(url: string): Promise<Buffer> {
    let user = await this.qrcodeManager.findOneDocument(this._qrcDB, "luround_url", url)
    
    // const isUser = await this.qrcodeManager.read(this._qrcDB, email)
    if(user !== null ) {
      const qrCode = await qrc.toDataURL(user.luround_url)
      return Buffer.from(qrCode.replace(/^data:image\/png;base64,/, ''), "base64")
    }
    throw new InternalServerErrorException({
      status: 500,
      message: ResponseMessages.QRCodeError
    })
  }
}
