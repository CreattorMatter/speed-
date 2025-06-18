# Administración de Usuarios y Seguridad

## 1. Objetivo

Este documento detalla los requerimientos para la implementación de un sistema de administración de usuarios y roles (RBAC), la integración con proveedores de identidad externos y otras mejoras de seguridad.

## 2. Feature: Portal de Administración de Permisos

-   **Descripción:** El menú de usuario actual solo contiene la opción "Cerrar Sesión". Es necesario expandirlo para incluir un portal de administración donde un superusuario pueda gestionar los permisos de otros usuarios.
-   **Requerimientos:**
    1.  **Punto de Acceso:** Añadir un enlace "Administración" o "Configuración de Usuarios" en el menú de perfil del usuario (disponible solo para administradores). **Este debe ser el ÚNICO punto de acceso al portal de administración**, ubicado en el header principal de la aplicación para mantener la consistencia.
    2.  **Página de Administración:** Esta página debe mostrar una tabla con todos los usuarios registrados.
    3.  **Permisos Granulares:** El administrador debe poder asignar permisos específicos a cada usuario. Se necesita definir una lista de permisos. Ejemplos:
        -   `builder:create-template`
        -   `builder:edit-template`
        -   `poster:edit-product` (Permiso para editar un producto dentro de un cartel)
        -   `poster:print`
        -   `families:create`
        -   `users:manage`
    4.  **Roles:** Para simplificar la asignación, se pueden crear roles (ej: "Diseñador", "Operador de Tienda") que agrupen un conjunto de permisos. El administrador asignaría roles a los usuarios.
    5.  **Flujo de Edición:** Al editar un producto sin permiso, el sistema no debería permitirlo. Si el usuario necesita hacerlo, puede haber un flujo de "solicitud de modificación" que envíe una notificación al administrador.

-   **Checklist:**
    -   [ ] Diseñar la UI para la tabla de usuarios y el modal/página de edición de permisos.
    -   [ ] Definir la lista completa de permisos granulares de la aplicación.
    -   [ ] Definir un conjunto inicial de roles de usuario.
    -   [ ] Modificar el esquema de la base de datos para almacenar roles y permisos por usuario.
    -   [ ] Implementar la lógica en el frontend y backend para restringir acciones basadas en permisos.
    -   [ ] Implementar el flujo de "solicitud de modificación".

## 3. Feature: Integración con Active Directory (AD)

-   **Descripción:** El cliente desea que los usuarios puedan autenticarse en la aplicación utilizando sus credenciales de la empresa a través de Active Directory.
-   **Preguntas para el Cliente:** Para proceder con la integración, necesitamos la siguiente información:
    1.  ¿Utilizan Azure Active Directory (Azure AD) o un Active Directory on-premise?
    2.  Si es on-premise, ¿está expuesto a través de ADFS (Active Directory Federation Services) o algún otro gateway?
    3.  ¿Cuál es el protocolo de federación preferido? (SAML 2.0, OpenID Connect).
    4.  Necesitaremos un endpoint de metadatos de federación (Federation Metadata URL).
    5.  ¿Qué atributos de usuario (claims) pueden enviarnos? (ej: `email`, `name`, `groups`/`roles`).
    6.  Necesitaremos crear una "Aplicación" en su AD para representar a nuestro sistema, para lo cual requeriremos que nos provean el `ClientID`, `TenantID`, y configurar un `Redirect URI`.
    7.  ¿Podemos contar con un entorno de pruebas de su AD para realizar la integración?

-   **Acciones:**
    -   [ ] Preparar un documento o email con estas preguntas para el cliente.
    -   [ ] Investigar librerías (ej. `passport-saml`, `msal.js`) para la integración una vez se tenga la información.

## 4. Feature: Autenticación de Dos Factores (2FA/MFA)

-   **Descripción:** Para acciones críticas (ej. modificar un cartel por parte de un usuario de sucursal), se requiere un segundo factor de autenticación y un sistema de solicitud de modificación.
-   **Documentación Detallada:** Ver el documento específico [SISTEMA_SOLICITUD_MODIFICACION.md](./SISTEMA_SOLICITUD_MODIFICACION.md) para la implementación completa del flujo.
-   **Opciones a Investigar:**
    1.  **Integración con Proveedores de MFA:** Si el cliente usa Microsoft o Google, se puede aprovechar su sistema de MFA. Al requerir el token, se podría redirigir al usuario a su proveedor de identidad para que valide su segundo factor.
    2.  **Librería de OTP:** Implementar una solución de Contraseña de un solo uso basada en tiempo (TOTP) utilizando librerías como `otplib`. Esto requeriría que el usuario enrole un dispositivo (ej. Google Authenticator, Microsoft Authenticator).

-   **Flujo de Solicitud de Modificación:**
    1. Usuario sin permisos completos intenta modificar un elemento
    2. Sistema solicita autenticación 2FA
    3. Se genera una solicitud que se envía al administrador
    4. Administrador aprueba/deniega la solicitud
    5. Usuario puede proceder o es notificado del rechazo

-   **Acciones:**
    -   [ ] Discutir con el cliente la criticidad de la operación y la experiencia de usuario deseada.
    -   [ ] Evaluar la viabilidad de cada opción. La integración con el proveedor existente suele ser preferible.
    -   [ ] Implementar el sistema completo de solicitud de modificación según [SISTEMA_SOLICITUD_MODIFICACION.md](./SISTEMA_SOLICITUD_MODIFICACION.md).

## 5. Requerimientos de Seguridad General

-   **[ ] JWT:** Verificar que la autenticación basada en tokens (JWT) esté implementada de forma segura (ej. corta duración para tokens de acceso, uso de refresh tokens, almacenamiento seguro).
-   **[ ] SSL:** Asegurar que toda la comunicación se realice sobre HTTPS. El despliegue final debe contar con un certificado SSL válido y correctamente configurado.

-   **Acciones:**
    -   [ ] Realizar una auditoría de la implementación actual de JWT.
    -   [ ] Incluir la configuración de SSL como un requisito indispensable en el plan de despliegue. 