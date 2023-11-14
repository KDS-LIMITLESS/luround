import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { CustomNotificationService } from './src/notificationsService.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.get(CustomNotificationService)
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(3000);
}
bootstrap();
