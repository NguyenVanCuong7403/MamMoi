FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["MamMoi.Api/MamMoi.Api.csproj", "MamMoi.Api/"]
COPY ["MamMoi.Application/MamMoi.Application.csproj", "MamMoi.Application/"]
COPY ["MamMoi.Infrastructure/MamMoi.Infrastructure.csproj", "MamMoi.Infrastructure/"]
COPY ["MamMoi.Domain/MamMoi.Domain.csproj", "MamMoi.Domain/"]

RUN dotnet restore "MamMoi.Api/MamMoi.Api.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/MamMoi.Api"
RUN dotnet build "MamMoi.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "MamMoi.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create uploads directory
RUN mkdir -p /app/wwwroot/uploads

ENTRYPOINT ["dotnet", "MamMoi.Api.dll"]

