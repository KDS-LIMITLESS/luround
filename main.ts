import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';
import { InternalServerErrorException, ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({origin: "*"})
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.PORT);
}
bootstrap().catch((err: any) => {
  console.log(err.message)
  // bootstrap()
});
