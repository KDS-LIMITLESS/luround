import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongoModule } from './store/db.module';
import { DatabaseService } from './store/db.service';
import { UserModule } from './user/user.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './global-error-handler';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    MongoModule.registerAsync(),
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    DatabaseService,
    // {
      // provide: APP_FILTER,
      // useClass: GlobalExceptionFilter,
    // },
  ],
})
export class AppModule {}
