import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { loadCronJobs } from './src/utils/mail.services.js';
import { FilterExceptions } from './src/utils/exception-filter.js'


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({origin: "*"})
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new FilterExceptions())
  await app.listen(process.env.PORT);
  await loadCronJobs()
}
bootstrap().catch((err: any) => {
  //console.log(err.message)
  // bootstrap()
});
