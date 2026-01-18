import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ Autoriser les requêtes venant de ton Frontend en ligne
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://concours-frontend.up.railway.app', // URL de ton interface
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ✅ Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Documentation de mon API NestJS avec Swagger')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ✅ Configuration du port pour Railway
  const port = process.env.PORT ?? 3000;
  
  // Important : écouter sur 0.0.0.0 pour que Railway puisse router le trafic
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 API disponible sur: https://concours-app.up.railway.app`);
  console.log(`📘 Swagger: https://concours-app.up.railway.app/api/docs`);
}

bootstrap();