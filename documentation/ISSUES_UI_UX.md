# Issues de UI/UX

## 1. Objetivo

Este documento es un registro de los problemas de interfaz de usuario (UI) y experiencia de usuario (UX) identificados en la aplicación. El propósito es centralizarlos para poder priorizarlos y solucionarlos.

## 2. Lista de Issues

### 2.1. Problemas de legibilidad en botones de Navegación y Administración

-   **Ubicación:** Layout principal y Portal de Administración.
-   **Descripción:** Varios botones y enlaces clave son ilegibles debido a una falta de contraste entre el color del texto y el fondo.
    -   **Botón "Volver":** Texto blanco sobre fondo blanco.
    -   **Menú de Usuario ("Administración", "Cerrar Sesión"):** Texto blanco sobre fondo blanco o rojo sobre fondo blanco sin el estilo adecuado.
-   **Comportamiento Esperado:** El texto de los botones debe tener un color que contraste adecuadamente con su fondo para ser legible, siguiendo la paleta de colores general del layout.
-   **Prioridad:** **Crítica**. Afecta la navegación básica y la usabilidad del portal de administración.
-   **Checklist:**
    -   [ ] Localizar los componentes de los botones y sus estilos CSS.
    -   [ ] Corregir las reglas de CSS para que el color del texto sea el apropiado (ej. el color principal de la UI).
    -   [ ] Verificar que los botones se vean correctamente en todas las páginas donde aparecen.

### 2.2. Múltiples botones "Nuevo" en la gestión de plantillas

-   **Ubicación:** Sección de Familias -> Vista de Plantillas de una familia.
-   **Descripción:** Existen varios botones con el texto "Nueva Plantilla" o "Nuevo" que realizan la misma acción. Esto genera confusión y desordena la interfaz.
-   **Sugerencia:**
    1.  Dejar un único botón principal y claramente visible para "Crear Plantilla".
    2.  Analizar si otros botones son redundantes y eliminarlos.
    3.  Aplicar un principio similar en otras partes de la aplicación (ej. en el propio Builder) para asegurar consistencia.
-   **Prioridad:** Media.
-   **Checklist:**
    -   [ ] Identificar todos los botones redundantes en la vista de plantillas.
    -   [ ] Rediseñar la sección para que haya un único Call To Action (CTA) para crear plantillas.
    -   [ ] Revisar otras secciones (Builder, Cartelera) en busca de problemas similares.

### 2.3. Flujo de creación de "Nueva Familia" poco intuitivo

-   **Ubicación:** Sección de Familias.
-   **Descripción:** Al hacer clic en "Nueva Familia", el usuario es redirigido al portal de administración, lo cual es confuso y rompe el flujo de trabajo.
-   **Sugerencia:**
    1.  Reemplazar la redirección con un modal o una vista dedicada para la creación de familias.
    2.  Este nuevo flujo debe ser rápido, permitir ingresar el nombre de la nueva familia y, crucialmente, ofrecer la opción de "Clonar desde una familia existente" como se detalla en `GESTION_DE_ENTIDADES.md`.
-   **Prioridad:** Alta.
-   **Checklist:**
    -   [ ] Diseñar la UI/UX del modal de creación de familias.
    -   [ ] Implementar el modal.
    -   [ ] Integrar la funcionalidad de clonación de plantillas dentro de este nuevo flujo.