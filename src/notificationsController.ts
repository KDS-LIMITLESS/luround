// your.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import { CustomNotificationService } from './notificationsService';
import { SkipAuth } from './auth/jwt.strategy';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly changeTrackingService: CustomNotificationService) {}

  @SkipAuth()
  @Get('subscribe')
  subscribeToChanges(@Res() res) {
    this.changeTrackingService.addClient(res);
    this.changeTrackingService.sendNotifications();
    setTimeout(() => res.end(), 10000);
  }
}