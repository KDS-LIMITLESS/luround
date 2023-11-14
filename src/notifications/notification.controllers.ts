import { Controller, Sse, MessageEvent } from "@nestjs/common";
import { Observable, interval, map } from "rxjs";
import { NotificationsService } from "./notifications.services.js";
import { SkipAuth } from "src/auth/jwt.strategy.js";

@Controller('notifications')
export class NotificationsController {

  constructor(private notifications_service: NotificationsService) {}

  @SkipAuth()
  @Sse('/notify')
  SendNotifications(): Observable<MessageEvent>{
    return interval(1000).pipe(map((_ ) => ({data: this.notifications_service.send_bookings_notifications()})))
  }
}