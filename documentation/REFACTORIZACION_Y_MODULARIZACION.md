# Plan de Refactorización y Modularización

## 1. Objetivo

El objetivo de esta iniciativa es refactorizar y modularizar el código base para mejorar su legibilidad, mantenibilidad y rendimiento. Se busca descomponer componentes y lógica de negocio monolíticos en módulos más pequeños, cohesivos y reutilizables. Esto facilitará la comprensión del código para los desarrolladores y las herramientas de análisis estático (IDE, linters).

La sección de "Cartelera" ya ha sido modularizada y servirá como ejemplo a seguir.

## 2. Estrategia General

1.  **Identificar Dominios:** Agrupar componentes, hooks, servicios y tipos de datos por dominio de negocio (ej. `Builder`, `Products`, `Auth`, `Promotions`).
2.  **Co-ubicación:** Mover archivos relacionados a una misma carpeta de módulo. Por ejemplo, todo lo relacionado con la gestión de productos debería estar en `src/features/products/`.
3.  **Crear Puntos de Entrada:** Cada módulo debe exponer una interfaz pública clara a través de un archivo `index.ts`, exportando solo lo que otros módulos necesitan consumir.
4.  **Refactorizar Componentes Grandes:** Descomponer componentes de React que superen un umbral de líneas de código (ej. 300 líneas) en componentes más pequeños y especializados.
5.  **Extraer Lógica de Negocio:** Mover la lógica de negocio fuera de los componentes de UI hacia hooks personalizados, servicios o utilidades.

## 3. Áreas a Modularizar

La siguiente es una lista de las áreas que requieren atención prioritaria.

-   **[~] BuilderV3:**
    -   **Descripción:** Es el componente más complejo. Contiene la lógica del canvas, paneles, herramientas, manejo de estado, etc.
    -   **Acciones:**
        -   [x] Separar los paneles (`AdvancedFieldsPanel`, `LayersPanel`, `ToolPanel`) en sus propios módulos.
        -   [~] Extraer la lógica de arrastrar/soltar, redimensionar, guías inteligentes y historial en hooks reutilizables. (Algunos ya existen en `src/hooks`, verificar y consolidar).
        -   [ ] Modularizar la gestión del estado del Builder (`useBuilderState`).

-   **[x] Gestión de Productos (`Products`):**
    -   **Descripción:** Lógica relacionada con la selección, carga y gestión de productos.
    -   **Acciones:**
        -   [x] Crear un nuevo módulo `src/features/products`.
        -   [x] Mover los componentes `ProductSelector`, `ProductDetails`, `BulkUpload`, etc., a este nuevo módulo.
        -   [x] Centralizar los servicios y tipos de datos de productos.

-   **[x] Gestión de Promociones (`Promotions`):**
    -   **Descripción:** Lógica relacionada con la selección y gestión de promociones.
    -   **Acciones:**
        -   [x] Crear un nuevo módulo `src/features/promotions`.
        -   [x] Mover los componentes `PromotionSelect`, `AddPromotionModal`, etc., a este nuevo módulo.

-   **[x] Autenticación y Autorización (`Auth`):**
    -   **Descripción:** Lógica de login y gestión de sesión.
    -   **Acciones:**
        -   [x] Crear un nuevo módulo `src/features/auth`.
        -   [x] Mover el componente `Login` y los hooks relacionados con la autenticación.

-   **[x] Componentes de UI Genéricos (`ui`):**
    -   **Descripción:** El directorio `src/components/ui` ya existe, pero hay que asegurar que todos los componentes de UI reutilizables y sin lógica de negocio (Botones, Inputs, Modales, etc.) residan aquí.
    -   **Acciones:**
        -   [x] Revisar la carpeta `src/components` y mover elementos genéricos a `src/components/ui`.

## 4. Checklist de Tareas

- [x] Definir la estructura de directorios para los nuevos módulos (features).
- [x] Mover los archivos del módulo de Productos.
- [x] Mover los archivos del módulo de Promociones.
- [x] Mover los archivos del módulo de Autenticación.
- [~] Refactorizar el componente `BuilderV3.tsx` para usar los nuevos módulos y hooks.
- [x] Revisar y migrar componentes a `src/components/ui`. 