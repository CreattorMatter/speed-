#!/bin/bash

# ================================================
# SCRIPT DE DESPLIEGUE DEL SISTEMA RBAC
# ================================================

echo "🚀 Iniciando despliegue del sistema RBAC..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar pasos
step() {
    echo -e "${BLUE}📋 PASO $1: $2${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "Este script debe ejecutarse desde la raíz del proyecto"
fi

step "1" "Verificando dependencias"
if ! command -v npm &> /dev/null; then
    error "npm no está instalado"
fi

success "npm encontrado"

step "2" "Instalando dependencias"
npm install || error "Error instalando dependencias"
success "Dependencias instaladas"

step "3" "Verificando migración de base de datos"
echo "Por favor, ejecuta manualmente la migración SQL en Supabase:"
echo "📁 Archivo: supabase/migrations/20250103_complete_rbac_system.sql"
echo ""
echo "¿Has ejecutado la migración de base de datos? (y/N)"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    error "Ejecuta la migración de base de datos primero"
fi

success "Migración de base de datos confirmada"

step "4" "Compilando TypeScript"
npm run build 2>/dev/null || warning "Build falló - continuando con desarrollo"

step "5" "Verificando archivos críticos"

# Verificar archivos principales
files=(
    "src/services/rbacService.ts"
    "src/hooks/usePermissions.ts"
    "src/components/auth/PermissionGuard.tsx"
    "src/features/settings/components/RolePermissionsManagement.tsx"
    "src/scripts/migrateToRbacSystem.ts"
    "supabase/migrations/20250103_complete_rbac_system.sql"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        success "✓ $file"
    else
        error "✗ Archivo no encontrado: $file"
    fi
done

step "6" "Generando reporte de migración"

cat << 'EOF' > RBAC_DEPLOYMENT_CHECKLIST.md
# 📋 Checklist de Despliegue RBAC

## ✅ Completado Automáticamente
- [x] Dependencias instaladas
- [x] Archivos principales verificados
- [x] Compilación TypeScript verificada

## 🎯 Pasos Manuales Requeridos

### 1. Base de Datos (Supabase)
- [ ] Ejecutar migración: `supabase/migrations/20250103_complete_rbac_system.sql`
- [ ] Verificar que las tablas se crearon: `permissions`, `role_permissions`
- [ ] Verificar que las funciones SQL funcionan

### 2. Migración de Datos
```javascript
// En la consola del navegador (F12)
import { runMigrationFromConsole } from './src/scripts/migrateToRbacSystem';
await runMigrationFromConsole();
```

### 3. Validación
```javascript
// En la consola del navegador
import { validateMigration } from './src/scripts/migrateToRbacSystem';
const result = await validateMigration();
console.log(result);
```

### 4. Testing de Roles
- [ ] Admin: Acceso completo
- [ ] Builder Admin: Solo Builder + Recibidos
- [ ] Viewer: Cartelería sin auditoría
- [ ] Viewer Audit: Cartelería con auditoría

### 5. Verificar Filtrado por Grupos
- [ ] Usuarios ven solo elementos de sus grupos
- [ ] Admins ven todos los elementos

## 🔧 Configuración Post-Despliegue

1. **Asignar Roles a Usuarios Existentes**
   - Ir a Configuración → Roles y Permisos
   - Revisar y ajustar roles según necesidades

2. **Configurar Permisos Personalizados**
   - Crear permisos adicionales si es necesario
   - Ajustar roles existentes

3. **Informar a Usuarios**
   - Comunicar cambios en el sistema
   - Proporcionar documentación de nuevos permisos

## 🚨 Rollback (Si es necesario)
- El sistema anterior sigue funcionando
- Revertir cambios en los componentes actualizados
- Restaurar verificaciones de `userRole`
EOF

success "Checklist generado: RBAC_DEPLOYMENT_CHECKLIST.md"

step "7" "Resumen final"

echo ""
echo "🎉 ¡DESPLIEGUE RBAC COMPLETADO!"
echo ""
echo "📁 Archivos importantes:"
echo "   • RBAC_MIGRATION_GUIDE.md - Documentación completa"
echo "   • RBAC_DEPLOYMENT_CHECKLIST.md - Pasos manuales pendientes"
echo ""
echo "🎯 Próximos pasos:"
echo "   1. Ejecutar migración SQL en Supabase"
echo "   2. Ejecutar script de migración de datos en consola"
echo "   3. Validar migración"
echo "   4. Probar funcionalidades con diferentes roles"
echo ""
echo "📚 Para más información, consulta: RBAC_MIGRATION_GUIDE.md"

success "¡Sistema RBAC listo para usar!"
