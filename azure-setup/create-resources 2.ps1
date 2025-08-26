# Azure Static Web Apps Setup Script
# Este script crea los recursos necesarios en Azure

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$DomainName,
    
    [Parameter(Mandatory=$true)]
    [string]$Location = "eastus2",
    
    [Parameter(Mandatory=$true)]
    [string]$GitHubRepoUrl
)

# Verificar que Azure CLI esté instalado y logueado
if (!(Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Error "Azure CLI no está instalado. Instálalo desde https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
}

# Verificar login
$account = az account show --query "user.name" -o tsv 2>$null
if (!$account) {
    Write-Host "Iniciando sesión en Azure..."
    az login
}

Write-Host "✅ Conectado a Azure como: $account"

# Crear resource group si no existe
Write-Host "📁 Creando Resource Group: $ResourceGroupName"
az group create --name $ResourceGroupName --location $Location

# 1. Crear Azure Static Web App para desarrollo
Write-Host "🚀 Creando Azure Static Web App - Development"
$swaDevResult = az staticwebapp create `
    --name "$DomainName-dev" `
    --resource-group $ResourceGroupName `
    --source $GitHubRepoUrl `
    --location $Location `
    --branch "develop" `
    --app-location "/" `
    --output-location "dist" `
    --login-with-github

$swaDevToken = ($swaDevResult | ConvertFrom-Json).repositoryToken

# 2. Crear Azure Static Web App para testing
Write-Host "🧪 Creando Azure Static Web App - Testing"
$swaTestResult = az staticwebapp create `
    --name "$DomainName-test" `
    --resource-group $ResourceGroupName `
    --source $GitHubRepoUrl `
    --location $Location `
    --branch "test" `
    --app-location "/" `
    --output-location "dist" `
    --login-with-github

$swaTestToken = ($swaTestResult | ConvertFrom-Json).repositoryToken

# 3. Crear Azure Static Web App para producción
Write-Host "🌍 Creando Azure Static Web App - Production"
$swaProdResult = az staticwebapp create `
    --name "$DomainName-prod" `
    --resource-group $ResourceGroupName `
    --source $GitHubRepoUrl `
    --location $Location `
    --branch "main" `
    --app-location "/" `
    --output-location "dist" `
    --login-with-github

$swaProdToken = ($swaProdResult | ConvertFrom-Json).repositoryToken

# 4. Crear App Service Domain
Write-Host "🌐 Creando App Service Domain: $DomainName"
try {
    az appservice domain create `
        --resource-group $ResourceGroupName `
        --hostname $DomainName `
        --contact-info @domain-contact.json `
        --accept-terms
} catch {
    Write-Warning "No se pudo crear el dominio automáticamente. Créalo manualmente en el portal de Azure."
}

# 5. Crear DNS Zone
Write-Host "📡 Creando DNS Zone"
az network dns zone create `
    --resource-group $ResourceGroupName `
    --name $DomainName

# 6. Obtener las URLs por defecto de las Static Web Apps
$devUrl = az staticwebapp show --name "$DomainName-dev" --resource-group $ResourceGroupName --query "defaultHostname" -o tsv
$testUrl = az staticwebapp show --name "$DomainName-test" --resource-group $ResourceGroupName --query "defaultHostname" -o tsv
$prodUrl = az staticwebapp show --name "$DomainName-prod" --resource-group $ResourceGroupName --query "defaultHostname" -o tsv

Write-Host "`n🎉 ¡Recursos creados exitosamente!"
Write-Host "==============================================="
Write-Host "📊 RESUMEN DE RECURSOS CREADOS:"
Write-Host "==============================================="
Write-Host "🚀 Development URL: https://$devUrl"
Write-Host "🧪 Testing URL: https://$testUrl"
Write-Host "🌍 Production URL: https://$prodUrl"
Write-Host ""
Write-Host "🔑 TOKENS PARA GITHUB SECRETS:"
Write-Host "AZURE_STATIC_WEB_APPS_API_TOKEN_DEV: $swaDevToken"
Write-Host "AZURE_STATIC_WEB_APPS_API_TOKEN_TEST: $swaTestToken"
Write-Host "AZURE_STATIC_WEB_APPS_API_TOKEN_PROD: $swaProdToken"
Write-Host ""
Write-Host "📋 PRÓXIMOS PASOS:"
Write-Host "1. Agrega los tokens como secrets en tu repositorio de GitHub"
Write-Host "2. Configura los dominios personalizados en el portal de Azure"
Write-Host "3. Actualiza los registros DNS para apuntar a tus Static Web Apps"
Write-Host "4. Crea las ramas 'develop', 'test', y 'main' en tu repositorio"
