import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import * as qrc from 'qrcode'
import { DatabaseService } from "src/store/db.service";

@Injectable()
export class QRCodeService {

  constructor(private qrcodeManager:DatabaseService) {}

  async generate_qrcode(email: string): Promise<Buffer> {
    const qrCode = await qrc.toDataURL(email)
    const isUser = await this.qrcodeManager.getUserDocument(email)
    
    if(!qrCode || !isUser) {
      throw new InternalServerErrorException({
        status: 500,
        message: "Error generating QRCode"
      })
    }
    return Buffer.from(qrCode.replace(/^data:image\/png;base64,/, ''), "base64")
  }
}
