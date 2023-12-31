import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.PORT);
}
bootstrap();
