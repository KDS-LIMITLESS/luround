import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { connection } from './store/db.module';




@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    cache: true
  })],
  controllers: [AppController],
  providers: [AppService, connection],
})
export class AppModule {}
