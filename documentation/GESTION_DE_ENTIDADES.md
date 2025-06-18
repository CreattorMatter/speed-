# Gestión de Entidades: Familias y Plantillas

## 1. Objetivo

Este documento define los requerimientos para la gestión de las entidades principales del Builder: Familias y Plantillas. Esto incluye operaciones CRUD (Crear, Leer, Actualizar, Eliminar) y funcionalidades avanzadas como la copia de plantillas entre familias.

## 2. Gestión de Familias

Se debe poder gestionar las familias de plantillas. Una familia es un contenedor o agrupador de plantillas.

-   **Requerimientos Funcionales:**
    -   **[ ] Crear Familia:** Un usuario con los permisos adecuados debe poder crear una nueva familia. **El flujo debe ser a través de un modal intuitivo**, no una redirección. Este modal debe permitir:
        -   Asignar un nombre y opcionalmente una descripción.
        -   **Ofrecer la opción de clonar plantillas desde una familia existente**, como funcionalidad clave del proceso (ver sección 4).
    -   **[ ] Ver Familias:** Se debe mostrar una lista de todas las familias existentes.
    -   **[ ] Modificar Familia:** Se debe poder cambiar el nombre y/o la descripción de una familia existente.
    -   **[ ] Eliminar Familia:** Se debe poder eliminar una familia. El sistema debe preguntar por confirmación y advertir que se eliminarán todas las plantillas contenidas en ella.

## 3. Gestión de Plantillas

Se debe poder gestionar las plantillas dentro de cada familia.

-   **Requerimientos Funcionales:**
    -   **[ ] Crear Plantilla:** Dentro de una familia, se debe poder crear una nueva plantilla, lo que debería abrir el BuilderV3 para su diseño.
    -   **[ ] Ver Plantillas:** Al seleccionar una familia, se deben mostrar todas las plantillas que contiene.
    -   **[ ] Modificar Plantilla:** Se debe poder abrir una plantilla existente en el BuilderV3 para editarla.
    -   **[ ] Eliminar Plantilla:** Se debe poder eliminar una plantilla de una familia.

## 4. Feature Crítica: Creación y Clonación de Plantillas en un solo Flujo

-   **Descripción:** Un cliente necesita crear una nueva familia de plantillas que es muy similar a otra existente. En lugar de recrear todas las plantillas una por una, el flujo de creación de una nueva familia debe facilitar esto.
-   **Requerimientos:**
    1.  Al hacer clic en "Crear Familia", se debe abrir un **modal**.
    2.  Dentro del modal, el usuario ingresa el nombre de la nueva familia.
    3.  El modal debe presentar una opción clara, como un checkbox o un botón, para "Importar/Copiar Plantillas de otra familia".
    4.  Si el usuario elige esta opción, la interfaz del modal se expandirá para permitirle:
        -   Seleccionar una o más familias de origen.
        -   Ver y seleccionar las plantillas específicas que desea copiar.
    5.  Al confirmar, las plantillas seleccionadas deben ser **clonadas** y asociadas a la nueva familia.
    6.  **Modificación Post-Copia:** Se mencionó que el objeto `Header` suele cambiar. El sistema debería facilitar la modificación de elementos comunes (como el encabezado) en las plantillas recién copiadas, quizás a través de una acción en lote o una configuración durante la copia.

-   **Diseño Propuesto (a validar):**
    -   Un **modal de "Crear Familia"**.
    -   Paso 1: Ingresar nombre. Opción para "Importar plantillas".
    -   Paso 2 (si se importa): Vista de dos paneles. Izquierda: lista de familias. Derecha: plantillas de la familia seleccionada con checkboxes.
    -   Un botón "Crear y Copiar" que ejecuta la clonación.
    -   Para la modificación del header, se podría añadir un paso opcional en el wizard de copia: "Seleccionar nuevo Header para las plantillas importadas".

## 5. Checklist

- [ ] Implementar UI y lógica para el CRUD de Familias (con el nuevo modal de creación).
- [ ] Implementar UI y lógica para el CRUD de Plantillas.
- [ ] Verificar que la creación/modificación de plantillas se integre correctamente con el BuilderV3.
- [ ] **Diseñar e implementar el flujo de usuario (UX) para la creación de familias y copia de plantillas en un único modal.**
- [ ] Investigar y definir la mejor aproximación para la modificación en lote de headers post-copia. 