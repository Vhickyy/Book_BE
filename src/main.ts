import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  // app.enableCors({
  //   origin: ['http://192.168.1.210:4200', 'http://localhost:4200'],
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   credentials: true,
  // });
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

// docker compose -f bookbe.yml up --build -d
// docker logs -f book-be-dev
