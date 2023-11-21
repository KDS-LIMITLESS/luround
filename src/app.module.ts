import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { MongoModule } from './store/db.module.js';
import { DatabaseService } from './store/db.service.js';
import { UserModule } from './user/user.module.js';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './global-error-handler.js';
import { ProfileModule } from './profileManager/profile.module.js';
import { QRCodeModule } from './qrCode/qrcode.module.js';
import { ServicePageModule } from './servicePage/service-page.module.js';
import { PaymentsModule } from './payments/paystack.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BookingsModule } from './bookService/bookService.module.js';
import { CustomNotificationService } from './notificationsService.js';
import { NotificationsController } from './notificationsController.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true}), 
    MongoModule.registerAsync(),
    AuthModule,
    UserModule,
    ProfileModule,
    QRCodeModule,
    ServicePageModule,
    PaymentsModule,
    BookingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    DatabaseService,
    // CustomNotificationService
    // {
      // provide: APP_FILTER,
      // useClass: GlobalExceptionFilter,
    // },
  ],
})
export class AppModule {}
