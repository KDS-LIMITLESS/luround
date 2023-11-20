import { Controller, Get, Res } from '@nestjs/common';
import { CustomNotificationService } from './notificationsService.js';
import { SkipAuth } from './auth/jwt.strategy.js';

@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private readonly notificationService: CustomNotificationService) {}

  @SkipAuth()
  @Get('subscribe')
  subscribeToChanges(@Res() res) {
    console.log("ok")
    this.notificationService.addClient(res);
    this.notificationService.sendNotifications();
    setTimeout(() => res.end(), 10000);
  }

}

// Fix the custom user link. Make sure a slug dose not exist in db already.
// Use IDs instead of emails across the API
// Logout API660