# INSTRUCCIONES PARA REINGENIERÍA DEL MÓDULO BUILDER

---

## 1. Contexto y objetivo

Estás trabajando en una aplicación web para crear carteles promocionales de góndola de supermercado.  
Existe un módulo funcional llamado `/Builder` que debe ser completamente re-ingenierizado para convertirse en un constructor visual tipo Kanban, modular, escalable y persistente, utilizando Redux Toolkit para la gestión de estado.

---

## 2. Restricciones y reglas

- Trabaja **exclusivamente** dentro de la carpeta `/Builder`.
- **No modifiques** rutas ni la experiencia de usuario actual. El acceso debe seguir siendo `/builder` y todo debe funcionar igual desde esa URL.
- **No modifiques, muevas ni elimines** archivos o carpetas fuera de `/Builder`.
- Si existen funciones, utilidades o componentes útiles en el código actual, **debes reutilizarlos** y no destruirlos, salvo justificación técnica clara.
- El nuevo código debe ser **legible, bien comentado y fácil de mantener**.
- El sistema debe ser **fácilmente extensible**: agregar un nuevo tipo de elemento debe requerir solo la creación de un nuevo componente y su registro en la paleta, sin modificar la arquitectura central.

---

## 3. Investigación previa (OBLIGATORIA)

Antes de escribir código, **investiga y describe** cómo son los carteles de supermercado reales:

- ¿Qué elementos visuales y de información incluyen?
- ¿Cómo se estructuran jerárquicamente?
- ¿Qué estilos, proporciones y jerarquías suelen tener?
- ¿Qué elementos son imprescindibles para el usuario final?

**No generes código hasta que confirmes que entiendes estos puntos y los describas.**

---

## 4. Funcionalidades mínimas

- **Paleta de componentes arrastrables:** imágenes, textos, precios, íconos, logos, cuotas, origen, código, fechas, notas legales, etc.
- **Canvas de diseño libre:** zona donde el usuario puede colocar, mover, redimensionar y eliminar elementos.
- **Soporte para diferentes formatos de hoja:** (A4, A5, etc.), tanto vertical como horizontal.
- **Sistema de escala visual realista:** el canvas debe mostrar los elementos a escala proporcional a la impresión real, con indicadores visuales de escala y reglas/guías.
- **Snapping y guías de alineación:** para ayudar al usuario a alinear elementos.
- **Persistencia en Redux:** todo el estado del diseño debe estar en Redux Toolkit.
- **Exportación a JSON estructurado:** el sistema debe poder exportar el diseño final como un JSON que incluya todos los elementos, posiciones, tamaños, tipos y contenido.
- **Preparado para integración futura** con sistemas de impresión/cartelera, sin romper nada de lo ya hecho.

---

## 5. Estructura sugerida

Organiza la carpeta `/Builder` de forma modular y clara, por ejemplo:

```
/Builder
  /components
    Header.tsx
    Precio.tsx
    Descuento.tsx
    Cuotas.tsx
    Origen.tsx
    ZapCode.tsx
    RangoFecha.tsx
    NotaLegal.tsx
    Palette.tsx
    Canvas.tsx
    Controls.tsx
  /modules
    (módulos lógicos o de negocio, si aplica)
  /redux
    builderSlice.ts
  BuilderPage.tsx
```

---

## 6. Librerías recomendadas

- React DnD o dnd-kit para drag and drop.
- Redux Toolkit para el manejo de estado.
- Immer para inmutabilidad.
- Framer Motion (opcional) para animaciones suaves.
- html2canvas o dom-to-image para generación de previews.
- Zod o Yup para validaciones.

---

## 7. Importancia estratégica

⚠️ **CRUCIAL:**  
A partir de ahora, **todos los carteles que se construyan y guarden con este sistema serán las plantillas base que se verán y reutilizarán en cada una de las páginas de la familia del poster-editor**.

- La calidad, flexibilidad y robustez de este Builder impactará directamente en la experiencia de usuario y en la capacidad de personalización de todos los carteles promocionales del sistema.
- Las plantillas generadas aquí serán el punto de partida y referencia para todos los equipos, usuarios y módulos que utilicen el poster-editor en el futuro.
- Cualquier limitación, bug o mala decisión de arquitectura en este módulo se propagará a toda la familia de páginas y funcionalidades relacionadas con la edición, visualización e impresión de carteles.

**Por lo tanto, es fundamental que el sistema sea sólido, extensible, fácil de mantener y evolutivo, ya que será la base de la gestión de plantillas de carteles para toda la plataforma.**

---

## 8. Output esperado

- Carpeta `Builder` completamente modularizada y funcional.
- Un nuevo sistema Kanban visual donde los usuarios pueden construir carteles arrastrando y posicionando elementos.
- Persistencia en Redux del estado de diseño.
- Exportación a JSON estructurado del diseño final.
- Documentación básica de cómo extender el sistema con nuevos elementos.

---

## 9. Consulta y justificación

**Si tienes dudas sobre la interpretación de algún punto, consulta antes de avanzar.  
Justifica cualquier decisión técnica importante.**

---

¿Listo para comenzar?  
**Primero, describe tu investigación sobre la estructura y elementos de los carteles de supermercado antes de escribir código.**
