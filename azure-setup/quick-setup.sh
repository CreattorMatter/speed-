#!/bin/bash

# Script de setup rápido para Azure Static Web Apps
# Usage: ./quick-setup.sh <domain-name> <resource-group> <github-repo-url>

set -e

DOMAIN_NAME=$1
RESOURCE_GROUP=$2
GITHUB_REPO_URL=$3

if [ -z "$DOMAIN_NAME" ] || [ -z "$RESOURCE_GROUP" ] || [ -z "$GITHUB_REPO_URL" ]; then
    echo "❌ Uso: ./quick-setup.sh <domain-name> <resource-group> <github-repo-url>"
    echo "Ejemplo: ./quick-setup.sh midominio.com mi-proyecto-rg https://github.com/usuario/repo"
    exit 1
fi

echo "🚀 Configurando Azure Static Web Apps para $DOMAIN_NAME"
echo "📁 Resource Group: $RESOURCE_GROUP"
echo "📂 GitHub Repo: $GITHUB_REPO_URL"

# Verificar Azure CLI
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI no está instalado"
    echo "Instálalo desde: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Login check
if ! az account show &> /dev/null; then
    echo "🔐 Iniciando sesión en Azure..."
    az login
fi

ACCOUNT=$(az account show --query "user.name" -o tsv)
echo "✅ Conectado como: $ACCOUNT"

# Crear resource group
echo "📁 Creando Resource Group..."
az group create --name "$RESOURCE_GROUP" --location "eastus2" --output table

# Crear Static Web Apps
echo "🚀 Creando Azure Static Web App - Development"
DEV_RESULT=$(az staticwebapp create \
    --name "${DOMAIN_NAME}-dev" \
    --resource-group "$RESOURCE_GROUP" \
    --source "$GITHUB_REPO_URL" \
    --location "eastus2" \
    --branch "develop" \
    --app-location "/" \
    --output-location "dist" \
    --login-with-github)

echo "🧪 Creando Azure Static Web App - Testing"
TEST_RESULT=$(az staticwebapp create \
    --name "${DOMAIN_NAME}-test" \
    --resource-group "$RESOURCE_GROUP" \
    --source "$GITHUB_REPO_URL" \
    --location "eastus2" \
    --branch "test" \
    --app-location "/" \
    --output-location "dist" \
    --login-with-github)

echo "🌍 Creando Azure Static Web App - Production"
PROD_RESULT=$(az staticwebapp create \
    --name "${DOMAIN_NAME}-prod" \
    --resource-group "$RESOURCE_GROUP" \
    --source "$GITHUB_REPO_URL" \
    --location "eastus2" \
    --branch "main" \
    --app-location "/" \
    --output-location "dist" \
    --login-with-github)

# Obtener URLs
DEV_URL=$(az staticwebapp show --name "${DOMAIN_NAME}-dev" --resource-group "$RESOURCE_GROUP" --query "defaultHostname" -o tsv)
TEST_URL=$(az staticwebapp show --name "${DOMAIN_NAME}-test" --resource-group "$RESOURCE_GROUP" --query "defaultHostname" -o tsv)
PROD_URL=$(az staticwebapp show --name "${DOMAIN_NAME}-prod" --resource-group "$RESOURCE_GROUP" --query "defaultHostname" -o tsv)

# Crear DNS Zone
echo "📡 Creando DNS Zone..."
az network dns zone create --resource-group "$RESOURCE_GROUP" --name "$DOMAIN_NAME" --output table

echo ""
echo "🎉 ¡Setup completado exitosamente!"
echo "=================================================="
echo "📊 RECURSOS CREADOS:"
echo "=================================================="
echo "🚀 Development: https://$DEV_URL"
echo "🧪 Testing: https://$TEST_URL"  
echo "🌍 Production: https://$PROD_URL"
echo ""
echo "🔑 PRÓXIMOS PASOS:"
echo "1. Configura los GitHub Secrets en tu repositorio"
echo "2. Crea las ramas develop, test, y main"
echo "3. Configura los dominios personalizados"
echo "4. Actualiza los nameservers DNS"
echo ""
echo "📋 Para ver los nameservers de Azure DNS:"
echo "az network dns zone show --resource-group $RESOURCE_GROUP --name $DOMAIN_NAME --query nameServers --output table"
