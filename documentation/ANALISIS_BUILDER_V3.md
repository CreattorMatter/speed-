# Análisis del Builder V3

Este documento detalla los puntos de mejora, bugs y nuevas funcionalidades requeridas para el Builder V3.

## 1. Bug: Reglas (Rulers) no se actualizan con el zoom

- **Descripción:** Al cambiar el nivel de zoom en el canvas del Builder, las reglas horizontales y verticales no se redibujan para reflejar la nueva escala. Parecen "congeladas".
- **Comportamiento Esperado:** Las reglas deben actualizar sus marcas y numeración dinámicamente para corresponder con el nivel de zoom actual del canvas, proveyendo una referencia visual precisa en todo momento.
- **Prioridad:** Alta. Es un componente fundamental para la usabilidad del constructor.
- **Acción:**
  - [ ] Investigar el componente `Rulers.tsx` (o similar, como `EnhancedRulers.tsx`) y su estado.
  - [ ] Conectar el estado del zoom del canvas con el componente de las reglas.
  - [ ] Asegurar que la lógica de renderizado de las marcas (`unitConverter.getRulerMarks()`) se ejecute cada vez que el zoom cambie.

## 2. Flujo de Creación: Familia -> Plantilla -> Constructor

- **Descripción:** Se necesita corroborar el flujo completo desde la creación de una familia hasta el uso de una plantilla en el constructor.
- **Flujo a Verificar:**
  1.  Ir a la sección "Familias".
  2.  Crear una nueva familia.
  3.  Dentro de la nueva familia, crear una nueva plantilla.
  4.  Al crear la plantilla, el sistema debe redirigir o abrir el Builder V3 para diseñar la plantilla.
  5.  El guardado de esta plantilla debe asociarla correctamente a la familia creada.
- **Acción:**
  - [ ] Realizar una prueba E2E (End-to-End) del flujo descrito.
  - [ ] Documentar cualquier desviación o error encontrado.

## 3. Feature: Integración de Financiación en Plantillas

- **Descripción:** Actualmente, no está claro cómo integrar las opciones de financiación (cuotas, intereses, etc.) en las plantillas creadas con el Builder. El sistema anterior generaba una especie de "mini-plantilla" HTML para esto. Se necesita una solución robusta y flexible para el nuevo sistema.
- **Requerimientos:**
  - El usuario debe poder añadir un componente de "Financiación" a la plantilla dentro del Builder.
  - Este componente debe ser configurable (ej. seleccionar tipo de financiación, bancos, etc.).
  - En la vista de "Cartelera", al seleccionar una plantilla con un componente de financiación y un producto, la información debe renderizarse correctamente.
  - La lógica debe ser similar a la funcionalidad existente en la sección de carteles, pero integrada dentro del ecosistema del Builder.
- **Propuesta de Solución (a definir):**
  1.  **Bloque de Financiación:** Crear un nuevo tipo de bloque/elemento en el Builder llamado "Financiación".
  2.  **Panel de Configuración:** Al seleccionar este bloque, el panel lateral debe mostrar opciones para configurar las propiedades de la financiación.
  3.  **Renderizado Dinámico:** El componente debe ser capaz de renderizar la información de financiación que le llegue dinámicamente desde el producto seleccionado en la cartelera.
- **Acciones:**
  - [ ] Analizar el código actual de la funcionalidad de financiación en la cartelera.
  - [ ] Diseñar la arquitectura para el nuevo "Bloque de Financiación" en el Builder.
  - [ ] Definir el modelo de datos que necesitará este bloque. 