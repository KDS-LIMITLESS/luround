import { Module } from "@nestjs/common";
import { QRCodeController } from "./qrcode.controller.js";
import { QRCodeService } from "./qrcode.service.js";
import { DatabaseService } from "../store/db.service.js";

@Module({
  imports: [],
  controllers: [QRCodeController],
  providers: [QRCodeService, DatabaseService]
})

export class QRCodeModule {}