import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongoModule } from './store/db.module';
import { DatabaseService } from './store/db.service';
import { UserModule } from './user/user.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './global-error-handler';
import { ProfileModule } from './profileManager/profile.module';
import { QRCodeModule } from './qrCode/qrcode.module';
import { ServicePageModule } from './servicePage/service-page.module';
import { PaymentsModule } from './payments/paystack.module';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookService/bookService.module';
import { CustomNotificationService } from './notificationsService';
import { NotificationsController } from './notificationsController';

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
  controllers: [AppController, NotificationsController],
  providers: [
    AppService, 
    DatabaseService,
    CustomNotificationService
    // {
      // provide: APP_FILTER,
      // useClass: GlobalExceptionFilter,
    // },
  ],
})
export class AppModule {}
