# Etapa 1: Construir o backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-backend
WORKDIR /src
COPY ["Backend/GestaoClientes.API/GestaoClientes.API.csproj", "GestaoClientes.API/"]
RUN dotnet restore "GestaoClientes.API/GestaoClientes.API.csproj"
COPY . .
WORKDIR "/src/GestaoClientes.API"
RUN dotnet build "GestaoClientes.API.csproj" -c Release -o /app/build
RUN dotnet publish "GestaoClientes.API.csproj" -c Release -o /app/publish

# Etapa 2: Construir o frontend
FROM node:22-alpine3.20 AS build-frontend
WORKDIR /app
COPY Frontend/package*.json ./
RUN npm install
COPY Frontend/ .
RUN npm run build

# Etapa 3: Configurar a imagem final
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build-backend /app/publish ./backend
COPY --from=build-frontend /app/dist ./frontend
RUN dotnet ef database update -s GestaoClientes.API

# Execute o script para gerar dados de teste
WORKDIR /app/dist
RUN npx tsx src/utils/data.ts

# Configurar Nginx para servir o frontend e redirecionar as requisições de API para o backend
RUN apt-get update && apt-get install -y nginx
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
