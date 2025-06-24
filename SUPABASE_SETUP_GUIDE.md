# 🚀 Guía de Configuración de Supabase para SPID Builder V3

## 📋 Pasos para Configurar Supabase desde la Web

### 1. Crear Proyecto en Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en **"Start your project"** o **"Sign in"** si ya tienes cuenta
3. Crea una nueva organización si es necesario
4. Haz clic en **"New project"**
5. Completa la información:
   - **Name**: `spid-builder-v3`
   - **Database Password**: Genera una contraseña segura (¡guárdala!)
   - **Region**: Selecciona la más cercana a tu ubicación
   - **Pricing Plan**: Free tier está bien para empezar

### 2. Obtener las Variables de Entorno
Una vez creado el proyecto:

1. Ve a **Settings** > **API**
2. Copia los siguientes valores:
   - **URL**: `https://tu-proyecto.supabase.co`
   - **anon public**: `eyJ...` (clave pública)
   - **service_role**: `eyJ...` (clave privada - ¡SECRETA!)

### 3. Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Configuración de Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-aqui
VITE_SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role-aqui

# Configuración SAP (opcional por ahora)
REACT_APP_SAP_URL=https://tu-sap-servidor.com
REACT_APP_SAP_TOKEN=tu-token-sap

# Configuración Promociones (opcional por ahora)
REACT_APP_PROMOTIONS_URL=https://tu-promociones-servidor.com
REACT_APP_PROMOTIONS_TOKEN=tu-token-promociones
```

### 4. Ejecutar las Migraciones de Base de Datos

#### Opción A: Desde el Dashboard de Supabase (Recomendado)
1. Ve a **SQL Editor** en tu proyecto de Supabase
2. Crea una nueva consulta
3. Copia y pega el contenido del archivo: `supabase/migrations/20241214_create_builder_v3_tables.sql`
4. Ejecuta la consulta
5. Repite el proceso con: `supabase/migrations/20241214_insert_initial_families.sql`

#### Opción B: Usando Supabase CLI (Avanzado)
```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar proyecto
supabase init

# Configurar el proyecto remoto
supabase link --project-ref tu-proyecto-id

# Ejecutar migraciones
supabase db push
```

### 5. Configurar Storage (Almacenamiento de Imágenes)
1. Ve a **Storage** en el dashboard
2. Crea los siguientes buckets:
   - `posters` (para carteles generados)
   - `templates` (para plantillas)
   - `assets` (para recursos como imágenes de productos)
   - `exports` (para archivos exportados)

3. Para cada bucket, ve a **Policies** y agrega:
```sql
-- Política de lectura pública
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'posters');

-- Política de inserción para usuarios autenticados
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'posters' AND auth.role() = 'authenticated');
```

### 6. Configurar Autenticación
1. Ve a **Authentication** > **Settings**
2. En **Site URL**, agrega: `http://localhost:5173` (para desarrollo)
3. En **Redirect URLs**, agrega:
   - `http://localhost:5173/auth/callback`
   - `https://tu-dominio-produccion.com/auth/callback`

### 7. Verificar la Configuración
1. Reinicia tu servidor de desarrollo:
```bash
npm run dev
```

2. Ve a la aplicación y verifica:
   - Que no hay errores de conexión en la consola
   - Que puedes acceder al Builder V3
   - Que las familias aparecen cargadas

### 8. Datos de Prueba (Opcional)
Si quieres agregar plantillas de ejemplo, puedes ejecutar esta consulta en SQL Editor:

```sql
-- Insertar plantilla de ejemplo
INSERT INTO templates (name, family_type, description, canvas, created_by) VALUES
('Plantilla Ladrillazo Básica', 'ladrillazos', 'Plantilla básica para ofertas ladrillazo', 
 '{
   "width": 1080,
   "height": 1350,
   "backgroundColor": "#FFFFFF",
   "unit": "px",
   "dpi": 300
 }', 
 'admin@test.com');
```

## 🔧 Configuración Avanzada

### Habilitar Row Level Security (RLS)
Las migraciones ya incluyen RLS activado, pero puedes verificar en **Authentication** > **Policies**

### Configurar Webhooks (Opcional)
Para sincronización en tiempo real:
1. Ve a **Database** > **Webhooks**
2. Configura webhooks para las tablas importantes
3. Apunta a tu endpoint de aplicación

### Backup y Monitoreo
1. **Settings** > **Database** - Configura backups automáticos
2. **Reports** - Monitorea el uso y rendimiento

## 🚨 Troubleshooting

### Error: "Invalid API Key"
- Verifica que las variables `.env.local` estén correctas
- Asegúrate de que el archivo esté en la raíz del proyecto
- Reinicia el servidor después de cambiar las variables

### Error: "Table doesn't exist"
- Ejecuta las migraciones en SQL Editor
- Verifica que todas las tablas se crearon correctamente

### Error: "RLS Policy"
- Verifica que las políticas de seguridad estén configuradas
- Revisa que el usuario esté autenticado correctamente

## ✅ Checklist Final
- [ ] Proyecto de Supabase creado
- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas exitosamente
- [ ] Buckets de storage creados
- [ ] Políticas de seguridad configuradas
- [ ] Aplicación conectando sin errores
- [ ] Familias cargadas en Builder V3

¡Una vez completados estos pasos, tu SPID Builder V3 estará completamente operativo con Supabase! 🎉 