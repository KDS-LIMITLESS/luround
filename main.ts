import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { FilterExceptions } from './src/utils/exception-filter.js'
import { BookingsManager } from './src/bookService/bookService.sevices.js';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({origin: "*"})
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new FilterExceptions())
  await app.listen(process.env.PORT);

  const bookingService = app.get(BookingsManager)
  const jobs = await bookingService.load_cron_jobs()
}
bootstrap().catch((err: any) => {
  //console.log(err.message)
  // bootstrap()
});
