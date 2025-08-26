# Script para configurar registros DNS
param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$DomainName,
    
    [Parameter(Mandatory=$true)]
    [string]$DevSwaUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$TestSwaUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$ProdSwaUrl
)

Write-Host "🌐 Configurando registros DNS para $DomainName"

# Crear registro CNAME para dev
Write-Host "📡 Creando registro CNAME para dev.$DomainName"
az network dns record-set cname set-record `
    --resource-group $ResourceGroupName `
    --zone-name $DomainName `
    --record-set-name "dev" `
    --cname $DevSwaUrl

# Crear registro CNAME para test
Write-Host "📡 Creando registro CNAME para test.$DomainName"
az network dns record-set cname set-record `
    --resource-group $ResourceGroupName `
    --zone-name $DomainName `
    --record-set-name "test" `
    --cname $TestSwaUrl

# Crear registro CNAME para www (producción)
Write-Host "📡 Creando registro CNAME para www.$DomainName"
az network dns record-set cname set-record `
    --resource-group $ResourceGroupName `
    --zone-name $DomainName `
    --record-set-name "www" `
    --cname $ProdSwaUrl

# Mostrar nameservers para configurar en el registrador del dominio
Write-Host "`n📋 NAMESERVERS DE AZURE DNS:"
Write-Host "============================================="
az network dns zone show `
    --resource-group $ResourceGroupName `
    --name $DomainName `
    --query "nameServers" `
    --output table

Write-Host "`n✅ Registros DNS creados exitosamente!"
Write-Host "🔧 Recuerda configurar estos nameservers en tu registrador de dominio."
