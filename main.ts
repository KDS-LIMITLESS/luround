import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { getTotalRevenue, loadCronJobs } from './src/utils/mail.services.js';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({origin: "*"})
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.PORT);
  await loadCronJobs()
  await getTotalRevenue()
}
bootstrap().catch((err: any) => {
  //console.log(err.message)
  // bootstrap()
});
