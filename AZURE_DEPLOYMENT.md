# Deployment a Azure Static Web Apps

## Configuración de Variables de Entorno en Azure

Para que la aplicación funcione correctamente en Azure, necesitas configurar las siguientes variables de entorno en tu Azure Static Web App:

### Variables Requeridas

1. **VITE_SUPABASE_URL**: URL de tu instancia de Supabase
2. **VITE_SUPABASE_ANON_KEY**: Clave anónima de Supabase
3. **VITE_SUPABASE_SERVICE_KEY**: Clave de servicio de Supabase (para operaciones admin)

### Variables Opcionales

4. **VITE_OPENAI_API_KEY**: Clave API de OpenAI (para funciones de AI)
5. **VITE_MAPBOX_ACCESS_TOKEN**: Token de acceso de Mapbox
6. **VITE_AI_ANALYSIS_ENABLED**: `true` o `false` (por defecto: `true`)
7. **VITE_AI_REALTIME_ANALYSIS**: `true` o `false` (por defecto: `true`) 
8. **VITE_AI_ANALYSIS_DEBOUNCE_MS**: Milisegundos de debounce (por defecto: `2000`)

## Cómo Configurar en Azure Portal

1. Ve a tu Azure Static Web App en el portal
2. Navega a **Configuration** en el menú lateral
3. Haz clic en **Application settings**
4. Agrega cada variable con el botón **+ Add**
5. Guarda los cambios

## Estructura del Proyecto

```
├── staticwebapp.config.json  # Configuración de rutas y redirects
├── public/
│   ├── _redirects           # Redirects para SPA
│   └── ...
├── src/
│   └── ...
└── dist/                    # Output del build (generado automáticamente)
```

## Workflow de GitHub Actions

El deployment se activa automáticamente cuando:
- Se hace push al branch `develop`
- Se abre/actualiza un pull request hacia `develop`

## URLs de Acceso

- **Producción**: https://calm-bush-0dc45e110.1.azurestaticapps.net/
- **Preview**: Se genera una URL única para cada PR

## Comandos Locales

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Troubleshooting

Si encuentras problemas:

1. Verifica que todas las variables de entorno estén configuradas
2. Revisa los logs de build en GitHub Actions
3. Confirma que el branch correcto está siendo deployado
4. Verifica que no haya errores de TypeScript o ESLint

## Contacto

Para problemas técnicos, revisa los logs en:
- GitHub Actions (para errores de build)
- Azure Portal > Monitor (para errores en runtime)
