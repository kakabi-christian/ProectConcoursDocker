import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs'; // Pour vérifier les fichiers

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  console.log('----------------------------------------------------');
  console.log('🚀 DÉMARRAGE DU BACKEND EN MODE DEBUG LOGS');

  // 1. VÉRIFICATION DU RÉPERTOIRE DE TRAVAIL
  const rootDir = process.cwd();
  const uploadsPath = join(rootDir, 'uploads');
  const dossiersPath = join(uploadsPath, 'dossiers');
  
  console.log(`📂 Répertoire racine : ${rootDir}`);
  console.log(`📂 Chemin uploads : ${uploadsPath}`);

  // 2. VÉRIFICATION PHYSIQUE DES DOSSIERS
  if (!fs.existsSync(uploadsPath)) {
    console.log('⚠️ Le dossier /uploads n\'existe pas. Création...');
    fs.mkdirSync(uploadsPath, { recursive: true });
  }

  if (fs.existsSync(dossiersPath)) {
    const files = fs.readdirSync(dossiersPath);
    console.log(`✅ Dossier /uploads/dossiers trouvé !`);
    console.log(`📊 Nombre de fichiers à l'intérieur : ${files.length}`);
    if (files.length > 0) {
      console.log('📄 Liste des premiers fichiers :', files.slice(0, 5));
    }
  } else {
    console.log('❌ ERREUR : Le dossier /uploads/dossiers est absent du serveur.');
    console.log('💡 Note : Si tu as fait un push, vérifie que tes fichiers JPG/PDF ne sont pas ignorés par Git.');
    fs.mkdirSync(dossiersPath, { recursive: true });
  }

  // 3. CONFIGURATION DES FICHIERS STATIQUES
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });
  console.log('⚙️ Configuration useStaticAssets activée sur /uploads/');

  // 4. CONFIGURATION CORS
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
  console.log('🌐 CORS configuré pour le Frontend Railway et localhost');

  // 5. SWAGGER
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Debug des fichiers statiques et API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 6. LANCEMENT
  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`✅ Backend prêt sur le port ${port}`);
  console.log(`🔗 URL : https://concours-app.up.railway.app`);
  console.log('----------------------------------------------------');
}

bootstrap();