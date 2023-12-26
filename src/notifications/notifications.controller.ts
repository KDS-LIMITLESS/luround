import { Body, Controller, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { NotificationService } from "./notification.services.js";


@Controller('apiv1/notifications')
export class NotificationController {
  
  constructor(private notificationService: NotificationService) {}

  @Post('send-notification')
  async sendNotification(@Req() req, @Res() res, @Body() body ) {
    return res.status(HttpStatus.OK).json(await this.notificationService.send_notification(body.user_nToken))
  }
}