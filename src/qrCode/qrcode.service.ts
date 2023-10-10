import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import * as qrc from 'qrcode'
import ResponseMessages from "src/messageConstants";
import { DatabaseService } from "src/store/db.service";

@Injectable()
export class QRCodeService {
  _qrcDB =this.qrcodeManager.userDB
  constructor(private qrcodeManager:DatabaseService) {}

  async generate_qrcode(req: any): Promise<Buffer> {
    const {email} = req
    const qrCode = await qrc.toDataURL(email)
    const isUser = await this.qrcodeManager.read(this._qrcDB, email)
    
    if(!qrCode || !isUser) {
      throw new InternalServerErrorException({
        status: 500,
        message: ResponseMessages.QRCodeError
      })
    }
    console.log(Buffer.from(qrCode.replace(/^data:image\/png;base64,/, ''), "base64"))
    return Buffer.from(qrCode.replace(/^data:image\/png;base64,/, ''), "base64")
  }
}
