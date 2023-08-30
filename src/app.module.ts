import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongoModule } from './store/db.module';
import { DatabaseService } from './store/db.service';
import { ResponseData } from './logger.service';
import { AuthService} from './auth/auth.service';
import { GoogleStrategy } from './auth/google.startegy';


@Module({
  imports: [
    ConfigModule.forRoot(), 
    MongoModule.registerAsync()],
  controllers: [AppController, AuthController],
  providers: [
    AppService, 
    DatabaseService, 
    ResponseData, 
    AuthService, 
    GoogleStrategy
  ],
})
export class AppModule {}
