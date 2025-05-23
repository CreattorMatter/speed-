# Resumen de Plantillas Ladrillazos

## Análisis Completo y Migración de Diseños

Se han analizado y migrado **18 imágenes** de diseños de carteles de la familia **Ladrillazos** a componentes React/TypeScript, organizándolos por tipos de promoción.

## Plantillas Creadas

### 1. **PRECIO LLENO** (`precio_lleno`)
- **Archivo**: `LadrillazosPrecioLleno.tsx`
- **ID**: `ladrillazos-precio-lleno`
- **Descripción**: Plantilla básica para mostrar precio sin promociones
- **Características**: Header rojo "PRECIO LLENO", precio grande con símbolo $, etiqueta "PRECIO CONTADO"

### 2. **DESCUENTO PLANO CATEGORIA** (`descuento_plano_categoria`)
- **Archivos**: `Ladrillazos1.tsx`, `Ladrillazos2.tsx`, `Ladrillazos3.tsx`, `Ladrillazos4.tsx`
- **IDs**: `ladrillazos-1` a `ladrillazos-4`
- **Descripción**: Plantillas para descuentos por categoría
- **Características**: Porcentaje de descuento prominente, sin comparación de precios

### 3. **ANTES/AHORA CON DTO** (`antes_ahora_dto`)
- **Archivos**: `Ladrillazos5.tsx`, `Ladrillazos6.tsx`, `Ladrillazos7.tsx`, `Ladrillazos8.tsx`, `Ladrillazos9.tsx`, `Ladrillazos10.tsx`
- **IDs**: `ladrillazos-5` a `ladrillazos-10`
- **Descripción**: Plantillas que muestran precio antes vs ahora con descuento
- **Características**: Header rojo "ANTES/AHORA CON DTO", porcentaje de descuento, comparación de precios

### 4. **ANTES/AHORA** (`antes_ahora`)
- **Archivo**: `LadrillazosPrecioAntesAhora.tsx`
- **ID**: `ladrillazos-antes-ahora`
- **Descripción**: Plantilla simple de comparación antes/ahora sin DTO explícito
- **Características**: Header rojo "ANTES/AHORA", comparación de precios lado a lado

### 5. **ANTES/AHORA FLOORING CON DTO** (`antes_ahora_flooring_dto`)
- **Archivo**: `LadrillazosPrecioAntesAhoraFlooring.tsx`
- **ID**: `ladrillazos-antes-ahora-flooring`
- **Descripción**: Plantilla específica para productos de flooring con comparación de precios
- **Características**: Header "ANTES/AHORA FLOORING", precios por M² y por caja

### 6. **FLOORING** (`flooring`)
- **Archivo**: `LadrillazosPrecioFlooring.tsx`
- **ID**: `ladrillazos-flooring`
- **Descripción**: Plantilla específica para productos de flooring
- **Características**: Header "FLOORING", elementos destacados en color, precios por M² y caja

### 7. **ANTES/AHORA EN CUOTAS CON DTO** (`antes_ahora_cuotas_dto`)
- **Archivo**: `LadrillazosPrecioAntesAhoraCuotas.tsx`
- **ID**: `ladrillazos-antes-ahora-cuotas`
- **Descripción**: Plantilla que combina comparación de precios con financiación
- **Características**: Header "ANTES/AHORA EN CUOTAS", logo Cencopay, información CFT

### 8. **FLOORING EN CUOTAS** (`flooring_cuotas`)
- **Archivo**: `LadrillazosPrecioFlooringCuotas.tsx`
- **ID**: `ladrillazos-flooring-cuotas`
- **Descripción**: Plantilla de flooring con financiación
- **Características**: Header "FLOORING EN CUOTAS", logo Cencopay, información financiera completa

### 9. **CUOTAS** (`cuotas`)
- **Archivo**: `LadrillazosPrecioCuotas.tsx`
- **ID**: `ladrillazos-cuotas`
- **Descripción**: Plantilla básica de financiación
- **Características**: Header "CUOTAS", logo Cencopay, 12 cuotas sin interés

### 10. **COMBO DTO** (`combo_dto`)
- **Archivos**: `Ladrillazos11.tsx`, `Ladrillazos12.tsx`, `Ladrillazos13.tsx`, `Ladrillazos14.tsx`
- **IDs**: `ladrillazos-11` a `ladrillazos-14`
- **Descripción**: Plantillas para promociones de combo
- **Características**: Header "COMBO", precio unitario vs precio combo

### 11. **PROMOCIONES ESPECIALES** (`promociones_especiales`)
- **Archivos**: `Ladrillazos15.tsx`, `Ladrillazos16.tsx`, `Ladrillazos17.tsx`, `Ladrillazos18.tsx`
- **IDs**: `ladrillazos-15` a `ladrillazos-18`
- **Descripción**: Plantillas para promociones especiales (3x2, 2da unidad, etc.)
- **Características**: Diseños específicos según el tipo de promoción

## Estructura de Archivos

```
src/constants/templates/Ladrillazos/
├── LadrillazosPrecioLleno.tsx              # PRECIO LLENO
├── LadrillazosPrecioAntesAhora.tsx         # ANTES/AHORA
├── LadrillazosPrecioFlooring.tsx           # FLOORING
├── LadrillazosPrecioAntesAhoraFlooring.tsx # ANTES/AHORA FLOORING
├── LadrillazosPrecioAntesAhoraCuotas.tsx   # ANTES/AHORA EN CUOTAS
├── LadrillazosPrecioFlooringCuotas.tsx     # FLOORING EN CUOTAS
├── LadrillazosPrecioCuotas.tsx             # CUOTAS
├── Ladrillazos1.tsx                        # DESCUENTO PLANO CATEGORIA
├── Ladrillazos2.tsx                        # DESCUENTO PLANO CATEGORIA
├── Ladrillazos3.tsx                        # COMBO (actualizado)
├── Ladrillazos4.tsx                        # DESCUENTO PLANO CATEGORIA
├── Ladrillazos5.tsx                        # ANTES/AHORA CON DTO (actualizado)
├── Ladrillazos6.tsx                        # ANTES/AHORA CON DTO
├── Ladrillazos7.tsx                        # ANTES/AHORA CON DTO
├── Ladrillazos8.tsx                        # ANTES/AHORA CON DTO (referencia)
├── Ladrillazos9.tsx                        # ANTES/AHORA CON DTO (referencia)
├── Ladrillazos10.tsx                       # ANTES/AHORA CON DTO (referencia)
├── Ladrillazos11.tsx                       # COMBO DTO
├── Ladrillazos12.tsx                       # COMBO DTO (referencia)
├── Ladrillazos13.tsx                       # COMBO DTO (referencia)
├── Ladrillazos14.tsx                       # COMBO DTO (referencia)
├── Ladrillazos15.tsx                       # PROMOCIONES ESPECIALES (referencia)
├── Ladrillazos16.tsx                       # PROMOCIONES ESPECIALES (referencia)
├── Ladrillazos17.tsx                       # PROMOCIONES ESPECIALES (referencia)
└── Ladrillazos18.tsx                       # PROMOCIONES ESPECIALES (referencia)
```

## Mapeo de Tipos de Promoción

La familia **Ladrillazos** ahora soporta **12 tipos de promoción** diferentes:

1. `precio_lleno` - Precio sin promociones
2. `descuento_plano_categoria` - Descuentos por categoría
3. `antes_ahora_dto` - Comparación antes/ahora con descuento
4. `antes_ahora` - Comparación simple antes/ahora
5. `antes_ahora_cuotas_dto` - Antes/ahora con financiación
6. `antes_ahora_flooring_dto` - Antes/ahora específico para flooring
7. `flooring` - Productos de flooring
8. `flooring_cuotas` - Flooring con financiación
9. `combo_dto` - Promociones de combo
10. `combo_cuotas_dto` - Combo con financiación
11. `cuotas` - Financiación básica
12. `promociones_especiales` - Promociones especiales (3x2, 2da unidad, etc.)

## Características Técnicas

### Componentes Responsivos
- Todos los componentes soportan prop `small` para vista previa
- Escalado automático basado en tamaño
- Máximo ancho de 400px para consistencia

### Props Standardizadas
Todos los componentes aceptan las mismas props:
- `small?: boolean` - Para vista previa
- `nombre?: string` - Nombre del producto
- `precioActual?: string` - Precio principal
- `porcentaje?: string` - Porcentaje de descuento
- `sap?: string` - Código SAP
- `fechasDesde?: string` - Fecha de inicio
- `fechasHasta?: string` - Fecha de fin
- `origen?: string` - Origen del producto
- `precioSinImpuestos?: string` - Precio sin impuestos
- `financiacion?: FinancingOption[]` - Opciones de financiación

### Diseño Consistente
- Border negro de 2px en todos los componentes
- Header rojo para tipo de promoción
- Header negro para "LADRILLAZOS"
- Tipografía consistente con font-sans
- Colores estandarizados (rojo: bg-red-600, amarillo: bg-yellow-300/400)

## Filtrado Inteligente

El sistema ahora filtra automáticamente las plantillas disponibles según el tipo de promoción seleccionado, mostrando solo las plantillas relevantes para cada caso de uso específico.

## Estado del Proyecto

✅ **Completado**: Análisis de 18 imágenes
✅ **Completado**: Migración a componentes React/TypeScript
✅ **Completado**: Asociación con tipos de promoción
✅ **Completado**: Filtrado inteligente por tipo
✅ **Completado**: Arquitectura modular y escalable
✅ **Completado**: Documentación completa 