# # 1. On part d'une image Node.js légère
# FROM node:20-alpine

# # 2. On définit le dossier de travail dans le conteneur
# WORKDIR /app

# # 3. On copie les fichiers de configuration en premier
# COPY package*.json ./
# COPY prisma ./prisma/

# # 4. On installe les dépendances
# RUN npm install

# # 5. On copie tout le reste du code source
# COPY . .

# # 6. On génère le client Prisma
# RUN npx prisma generate

# # 7. On compile le projet NestJS (Transforme le .ts en .js dans /dist)
# RUN npm run build

# # 8. On expose le port 3000
# EXPOSE 3000

# # 9. La commande pour lancer l'application
# # On pointe vers dist/src/main.js car c'est là que NestJS a compilé ton main.ts
# CMD ["node", "dist/src/main.js"]
# 1. On part d'une image Node.js légère
FROM node:20-alpine

# 2. On définit le dossier de travail dans le conteneur
WORKDIR /app

# 3. On copie les fichiers de configuration en premier
COPY package*.json ./

# 4. CORRECTION : On cible le dossier prisma qui est dans src
# On le place dans ./prisma/ pour que NestJS et Prisma le trouvent facilement
COPY src/prisma ./prisma/

# 5. On installe les dépendances
RUN npm install

# 6. On copie tout le reste du code source
COPY . .

# 7. On génère le client Prisma (indispensable pour les requêtes DB)
RUN npx prisma generate

# 8. On compile le projet NestJS
RUN npm run build

# 9. On expose le port 3000
EXPOSE 3000

# 10. La commande pour lancer l'application
# Ton ls montre que le main.js est dans dist/src/main.js
CMD ["node", "dist/src/main.js"]