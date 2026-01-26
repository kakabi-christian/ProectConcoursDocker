import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path'; // Ajouté pour gérer les chemins de dossiers

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ SERVIR LES FICHIERS STATIQUES (Images, PDF)
  // Indispensable pour que https://.../uploads/dossiers/fichier.jpg fonctionne
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // ✅ CONFIGURATION CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://concours-frontend.up.railway.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ✅ CONFIGURATION SWAGGER
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Documentation de mon API NestJS avec Swagger')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ✅ CONFIGURATION PORT (RAILWAY)
  const port = process.env.PORT ?? 3000;
  
  // Ecouter sur 0.0.0.0 est obligatoire pour Railway
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 API disponible sur: https://concours-app.up.railway.app`);
  console.log(`📘 Swagger: https://concours-app.up.railway.app/api/docs`);
}

bootstrap();