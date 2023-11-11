import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { CustomNotificationService } from 'src/notificationsService';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.get(CustomNotificationService)
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(3000);
}
bootstrap();
