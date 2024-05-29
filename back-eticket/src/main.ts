import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000', // URL de tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  const options = new DocumentBuilder()
    .setTitle('NestJs API // RADIOTICKET')
    .setDescription('Proyecto Final // RADIOTICKET')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  app.use(morgan('dev'));
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  await app.listen(3001);
  console.log('Listening on port 3001');
}
bootstrap();
