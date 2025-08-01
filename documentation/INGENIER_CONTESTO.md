# 🧠 Ingeniería de Contexto para Cursor – Proyecto `Speed`

## 🎯 Propósito
Este documento define el comportamiento esperado de **un nuevo componente visual para logos de financiación** y **dos nuevos campos dinámicos (`cuota`, `precio_cuota`)** en el entorno `Builder` del proyecto **Speed**. Está pensado para que Cursor o cualquier modelo IA entienda exactamente cómo actuar sin ambigüedades.

---

## 🧩 Componente Especial: Imagen de Financiación

### ✅ Descripción
- Componente nuevo arrastrable al Builder desde el panel lateral.
- Representa **una imagen vacía** que luego será completada automáticamente **desde la cartelera**, no editable manualmente.
- Sirve para mostrar un **logo de financiación** (Visa, Mastercard, etc.).

### 🛑 Restricciones
- No se puede subir imagen manualmente.
- No se edita desde el builder.
- No debe activar el sistema de edición ni el modal de edición.
- No debe ser considerado una edición para el sistema de reporte.

### 🧭 Comportamiento
1. Al crear la plantilla, el componente aparece vacío.
2. En la cartelera:
   - Al hacer clic sobre el componente, se abre un **modal** con los logos de financiación.
   - El usuario elige uno, y el logo se renderiza automáticamente.
3. El logo se ajusta al tamaño definido del componente.
4. El componente **no dispara** el modal de reporte ni se guarda como edición.
5. Los logos se obtienen desde una **carpeta interna del sistema**, accesible por la app.

---

## 🧮 Nuevos Campos Dinámicos: `cuota` y `precio_cuota`

### ✅ Naturaleza
- Son **campos dinámicos** y deben estar disponibles solo cuando:
  - Se agrega un componente de texto dinámico.
  - Se elige el **tipo de contenido: Campo Dinámico**.
- En esa sección, aparecerán junto a los demás campos del producto disponibles.
- Son **valores calculados en tiempo real**, no persistidos.

### 📥 Inserción
- Al seleccionarlos en el texto dinámico se insertan como:
  - `{cuota}`
  - `{precio_cuota}`
- Ambos se inician en valor **cero (0)**.
- Se renderizan como texto visible (ej. “Cuotas: 0”, “$0,00”).

### ⚙️ Lógica
Cuando el usuario:
- Selecciona un producto desde la cartelera.
- Define una cantidad de cuotas.

Entonces:
- `{cuota}` se actualiza con el número seleccionado.
- `{precio_cuota}` se calcula:  
  `precio_producto / cuota`

**Ejemplo**:
- Precio del producto: $60.000  
- Cuotas elegidas: 6  
- Resultado:
  - `{cuota}` → 6  
  - `{precio_cuota}` → $10.000

### 🚫 Exclusiones
- No deben considerarse una edición.
- No activan modal de edición ni de reporte.
- Se calculan automáticamente como parte del flujo de la cartelera.

---

## 📦 Logos de Financiación
- Se almacenan en una carpeta del sistema accesible por el front.
- Cursor debe asumir que el modal los carga directamente.
- No debe implementarse lógica de carga ni subida manual.

---

## 🧠 Instrucciones específicas para Cursor

- No envolver este componente ni los campos en flujos de edición.
- No guardar `{cuota}` ni `{precio_cuota}` en base de datos.
- El modal del logo es **visual y de selección**, no de edición.
- Estos elementos no deben ser tratados como “ediciones” ni enviados al sistema de reporte.
- No renderizar botones de editar en este componente.

---

