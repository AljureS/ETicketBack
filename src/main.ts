import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { auth } from 'express-openid-connect'
// import { config as auth0Config} from './config/auth0.config'//? PORFA NO ELIMNAR ESTA LINEA
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(
  //   {
  //   origin: ['process.env.FRONT_URL',"https://front-radio-ticket.vercel.app/","https://radioticket.onrender.com"], // URL de tu frontend
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   credentials: true,
  // }
  );
  
  const options = new DocumentBuilder()
    .setTitle('NestJs API // RADIOTICKET')
    .setDescription('Proyecto Final // RADIOTICKET')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  // app.use(auth(auth0Config)) //? PORFA NO ELIMNAR ESTA LINEA
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      // forbidNonWhitelisted: true, //?comentar al registrar usuario 
    }),
  );
  app.use(morgan('dev'));
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/', app, document);
  
  await app.listen(3001);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();