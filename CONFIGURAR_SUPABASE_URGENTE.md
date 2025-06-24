# 🚨 CONFIGURACIÓN URGENTE - Variables de Entorno

## ❌ **PROBLEMA DETECTADO**
No tienes el archivo `.env.local` configurado, por eso Supabase falla.

## ✅ **SOLUCIÓN RÁPIDA (2 MINUTOS)**

### 1. **Crear archivo `.env.local`**
En la raíz de tu proyecto, crea un archivo llamado `.env.local`:

```bash
# En la terminal, desde la raíz del proyecto:
touch .env.local
```

### 2. **Agregar contenido TEMPORAL**
Mientras configuras Supabase, usa esto:

```env
# ===== CONFIGURACIÓN TEMPORAL =====
VITE_SUPABASE_URL=https://placeholder.supabase.co
VITE_SUPABASE_ANON_KEY=placeholder-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=placeholder-service-key
```

### 3. **Verificar que funcione**
- Guarda el archivo
- El servidor debería reiniciarse automáticamente
- Ve a la consola del navegador - deberías ver: "⚠️ Supabase NO configurado - usando placeholders"

## 🎯 **CONFIGURACIÓN REAL DE SUPABASE**

### **Paso 1: Crear proyecto en Supabase**
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea cuenta si no tienes
3. Haz clic en "New project"
4. Completa:
   - **Name**: `spid-builder-v3`
   - **Password**: [Genera una y guárdala]
   - **Region**: `South America (São Paulo)`

### **Paso 2: Obtener variables**
Una vez creado el proyecto:
1. Ve a **Settings** > **API**
2. Copia:
   - **URL**: Tu URL de proyecto
   - **anon public**: Tu clave pública

### **Paso 3: Actualizar .env.local**
Reemplaza el contenido de `.env.local`:

```env
# ===== CONFIGURACIÓN REAL DE SUPABASE =====
VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-aqui
VITE_SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role-aqui
```

### **Paso 4: Crear tablas**
1. En Supabase, ve a **SQL Editor**
2. Copia y pega el contenido de: `supabase/migrations/20241214_create_builder_v3_tables.sql`
3. Ejecutar
4. Haz lo mismo con: `supabase/migrations/20241214_insert_initial_families.sql`

## 🏃‍♂️ **ACCIÓN INMEDIATA**

**AHORA MISMO:**
1. Crea el archivo `.env.local` con el contenido temporal
2. La app funcionará inmediatamente en modo mock
3. Cuando tengas tiempo, configura Supabase real

**EN LA CONSOLA VERÁS:**
- ✅ Sin errores de chunk
- ⚠️ "Supabase NO configurado - usando placeholders"
- 📦 "Usando familias mock"

¡La aplicación funcionará perfectamente mientras configuras Supabase! 