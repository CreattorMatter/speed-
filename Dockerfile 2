# Usa una imagen base de Node.js para la etapa de construcción
FROM node:18-alpine AS build

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de manifiesto del proyecto
COPY package.json package-lock.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto de los archivos del proyecto
COPY . .

# Construye la aplicación para producción
RUN npm run build

# Usa una imagen base de Nginx para la etapa de servicio
FROM nginx:1.21-alpine AS production

# Copia los archivos de construcción de la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copia la configuración personalizada de Nginx
# Esto es importante para que las rutas de React Router funcionen correctamente
COPY netlify.toml /etc/nginx/conf.d/default.conf

# Expone el puerto 80 para el tráfico entrante
EXPOSE 80

# Comando para iniciar Nginx cuando el contenedor se inicie
CMD ["nginx", "-g", "daemon off;"] 