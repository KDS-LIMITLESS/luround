import { Module } from "@nestjs/common";
import { NotificationController } from "./notifications.controller.js";
import { NotificationService } from "./notification.services.js";
import { DatabaseService } from "../store/db.service.js";

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, DatabaseService]
})

export class NotificationModule {}