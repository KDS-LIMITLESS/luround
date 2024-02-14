import { Body, Controller, Get, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { NotificationService } from "./notification.services.js";


@Controller('api/v1/notifications')
export class NotificationController {
  
  constructor(private notificationService: NotificationService) {}

  @Post('send-test-notification')
  async sendTestNotification(@Req() req, @Res() res, @Body() body ) {
    return res.status(HttpStatus.OK).json(await this.notificationService.send_notification(body.user_nToken))
  }

  @Post('send-notification')
  async sendNotification(@Req() req, @Res() res, @Body() payload ) {
    return res.status(HttpStatus.OK).json(await this.notificationService.construct_notification_detail(payload.notification_userId, payload.user_nToken, payload.title, payload.body, payload.service_name))
  }

  @Get('user-notifications')
  async getUserNotifications(@Req() req, @Res() res) {
    return res.status(HttpStatus.OK).json(await this.notificationService.get_user_notifications(req.user.userId) )
  }
}