# Funcionalidades y Flujos de Trabajo Core

## 1. Objetivo

Este documento describe los flujos de trabajo principales (end-to-end) que deben estar operativos en la aplicación. La correcta implementación de estos flujos es crítica para la funcionalidad básica del sistema.

## 2. Flujo Principal: Creación y Uso de un Cartel

Este es el "camino feliz" que un usuario administrador o con permisos completos debería poder realizar sin inconvenientes.

-   **Descripción del Flujo:**
    1.  **Ir al Builder:** Navegar a la sección del Builder.
    2.  **Crear Familia:** Crear una nueva familia de plantillas (ej: "Ofertas de Verano").
    3.  **Crear Plantilla:** Dentro de la familia, crear una nueva plantilla. El sistema abre el Builder.
    4.  **Diseñar Plantilla:** Añadir y configurar elementos en el canvas (textos, imágenes, placeholders para datos de producto).
    5.  **Guardar Plantilla:** Guardar el diseño de la plantilla.
    6.  **Ir a Cartelera:** Navegar a la sección de "Cartelera".
    7.  **Seleccionar Familia:** Filtrar o buscar la familia "Ofertas de Verano".
    8.  **Seleccionar Plantilla:** Seleccionar la plantilla recién creada.
    9.  **Seleccionar Producto:** Escoger un producto para aplicar a la plantilla. Los datos del producto (precio, nombre, etc.) deben poblar los campos correspondientes.
    10. **Guardar/Generar Cartel:** Guardar el cartel final (plantilla + producto).
    11. **Vista Previa de Impresión:** Acceder a una vista previa que muestre cómo se verá el cartel en el papel.
    12. **Imprimir:** Enviar el cartel a la impresora.

-   **Checklist de Verificación:**
    -   [ ] Se puede crear una Familia.
    -   [ ] Se puede crear y guardar una Plantilla en el Builder.
    -   [ ] La sección Cartelera puede listar las Familias y Plantillas.
    -   [ ] La selección de un producto rellena los datos en la plantilla.
    -   [ ] La vista previa de impresión es fiel al diseño.
    -   [ ] El diálogo de impresión del sistema se abre correctamente.

## 3. Feature: Envío de Carteles a Sucursales

-   **Descripción:** Un usuario de la casa central (administrador) necesita poder preparar los carteles (plantilla + producto) y enviarlos digitalmente a una o más sucursales para que estas solo tengan que imprimirlos.
-   **Requerimientos del Flujo:**
    1.  **Selección de Carteles:** En la sección de Cartelera, después de haber generado uno o más carteles, el usuario debe poder seleccionarlos.
    2.  **Acción "Enviar a Sucursales":** Debe haber un botón o acción para iniciar el proceso de envío.
    3.  **Selección de Sucursales:** Al ejecutar la acción, debe aparecer una interfaz (probablemente un modal) que liste todas las sucursales disponibles. El usuario debe poder seleccionar una, varias o todas las sucursales de destino.
    4.  **Confirmación y Envío:** Al confirmar, el sistema debe "enviar" los carteles. Esto implica crear registros en la base de datos que asocien los carteles seleccionados con las sucursales de destino, marcándolos como "pendientes de impresión".
    5.  **Vista de la Sucursal:** Un usuario que inicie sesión desde una sucursal debe tener una vista donde pueda ver los carteles que le han sido enviados y que están listos para imprimir.

-   **Checklist de Desarrollo:**
    -   [ ] Diseñar la UI para la selección de carteles y la acción de envío.
    -   [ ] Implementar el modal de selección de sucursales.
    -   [ ] Definir y modificar el esquema de la base de datos para almacenar la relación `Cartel <-> Sucursal` y el estado del envío (ej: `pendiente`, `impreso`).
    -   [ ] Implementar la lógica del backend para procesar el envío.
    -   [ ] Crear la vista para el usuario de la sucursal donde pueda ver y imprimir los carteles recibidos. 