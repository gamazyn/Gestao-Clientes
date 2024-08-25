# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY . ./
RUN dotnet restore

COPY GestaoClientes.API/GestaoClientes.db /app/out/

RUN dotnet publish -c Debug -o out

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/out .

EXPOSE 5050

ENV ASPNETCORE_ENVIRONMENT=Development 

ENTRYPOINT ["dotnet", "GestaoClientes.API.dll"]
