import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongoModule } from './store/db.module';
import { DatabaseService } from './store/db.service';


@Module({
  imports: [
    ConfigModule.forRoot(), 
    MongoModule.registerAsync()],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
