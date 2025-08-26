#!/bin/bash

# 🚨 SCRIPT DE LIMPIEZA DE SEGURIDAD
# Este script limpia las claves comprometidas del historial de Git

echo "🚨 INICIANDO LIMPIEZA DE SEGURIDAD..."
echo "================================================"

# 1. Hacer backup del estado actual
echo "📦 Creando backup..."
git branch backup-before-cleanup

# 2. Limpiar archivos específicos del historial
echo "🧹 Limpiando archivos con claves comprometidas..."
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch CONFIGURAR_SUPABASE_URGENTE.md SUPABASE_SETUP_GUIDE.md' \
  --prune-empty --tag-name-filter cat -- --all

# 3. Limpiar referencias
echo "🗑️ Limpiando referencias..."
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 4. Mostrar estado
echo "✅ Limpieza completada!"
echo "================================================"
echo "📋 PRÓXIMOS PASOS MANUALES:"
echo "1. Ve a Supabase Dashboard y REVOCA las claves"
echo "2. Genera nuevas claves"
echo "3. Actualiza tu .env.local con las nuevas claves"
echo "4. Ejecuta: git push origin --force --all"
echo "5. Ejecuta: git push origin --force --tags"
echo ""
echo "⚠️  IMPORTANTE: Comunica a tu equipo sobre el force push"
echo "================================================" 