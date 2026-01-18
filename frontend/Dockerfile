# Étape 1 : Construction (Build)
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# On construit les fichiers statiques
RUN npm run build

# Étape 2 : Service (Production avec Nginx)
FROM nginx:stable-alpine
# On copie les fichiers compilés de l'étape 1 vers le dossier que Nginx utilise
COPY --from=build-stage /app/build /usr/share/nginx/html
# Note : si tu utilises Vite, remplace /app/build par /app/dist
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]