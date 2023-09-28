import { Module } from "@nestjs/common";
import { QRCodeController } from "./qrcode.controller";
import { QRCodeService } from "./qrcode.service";
import { DatabaseService } from "src/store/db.service";

@Module({
  imports: [],
  controllers: [QRCodeController],
  providers: [QRCodeService, DatabaseService]
})

export class QRCodeModule {}