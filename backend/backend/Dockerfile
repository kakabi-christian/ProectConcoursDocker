# 1. On part d'une image Node.js légère
FROM node:20-alpine

# 2. On définit le dossier de travail dans le conteneur
WORKDIR /app

# 3. On copie les fichiers de configuration en premier
COPY package*.json ./
COPY prisma ./prisma/

# 4. On installe les dépendances
RUN npm install

# 5. On copie tout le reste du code source
COPY . .

# 6. On génère le client Prisma
RUN npx prisma generate

# 7. On compile le projet NestJS (Transforme le .ts en .js dans /dist)
RUN npm run build

# 8. On expose le port 3000
EXPOSE 3000

# 9. La commande pour lancer l'application
# On pointe vers dist/src/main.js car c'est là que NestJS a compilé ton main.ts
CMD ["node", "dist/src/main.js"]