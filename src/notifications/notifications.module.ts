import { Module } from "@nestjs/common";
import { NotificationsController } from "./notification.controllers.js";
import { NotificationsService } from "./notifications.services.js";
import { DatabaseService } from "src/store/db.service.js";

@Module({
  imports: [],
  controllers: [NotificationsController],
  providers: [NotificationsService, DatabaseService]
})

export class NotificationsModule {}