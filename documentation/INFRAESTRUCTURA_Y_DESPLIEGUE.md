# Infraestructura y Despliegue

## 1. Objetivo

Este documento tiene como finalidad recopilar la información necesaria del cliente para planificar el despliegue de la aplicación en su infraestructura de nube, ya sea Amazon Web Services (AWS) o Microsoft Azure.

## 2. Requerimientos de Información

Para poder preparar los artefactos de despliegue (ej. contenedores Docker, scripts de Infraestructura como Código) y configurar los pipelines de CI/CD, necesitamos que el cliente nos proporcione la siguiente información.

### 2.1. Preguntas Generales

1.  **Proveedor de Nube:** ¿Cuál es el proveedor de nube que utilizan? (AWS, Azure, otro)
2.  **Entornos:** ¿Cuántos entornos necesitamos configurar? (ej. Desarrollo, Staging, Producción)
3.  **Gestión de Infraestructura:** ¿Cómo gestionan su infraestructura actual? (ej. manualmente a través de la consola, Terraform, CloudFormation, Bicep)
4.  **CI/CD:** ¿Tienen un sistema de Integración y Despliegue Continuo? (ej. Jenkins, GitLab CI, GitHub Actions, Azure DevOps)
5.  **Dominio y DNS:** ¿Quién gestionará los registros DNS para el dominio de la aplicación?

### 2.2. Si utilizan AWS

1.  **Servicios de Cómputo:** ¿Cuál es su preferencia para ejecutar la aplicación?
    -   **ECS (Elastic Container Service):** Ideal para contenedores Docker.
    -   **EKS (Elastic Kubernetes Service):** Si ya utilizan Kubernetes.
    -   **Amplify:** Para aplicaciones web full-stack serverless.
    -   **EC2:** Máquinas virtuales (menos preferido para aplicaciones modernas).
2.  **Base de Datos:** ¿Dónde residirán los datos? (ej. Supabase es una opción, pero si tienen una base de datos corporativa, necesitamos saber cuál es: RDS, Aurora).
3.  **Autenticación y Permisos (IAM):** Necesitaremos un rol de IAM con los permisos necesarios para que nuestro pipeline de CI/CD pueda desplegar los recursos. ¿Crearán ustedes el rol o debemos proveerles una política de permisos?
4.  **Acceso:** ¿Cómo se nos proporcionará el acceso a la cuenta de AWS? (ej. a través de un usuario IAM, asumiendo un rol).

### 2.3. Si utilizan Azure

1.  **Servicios de Cómputo:** ¿Cuál es su preferencia?
    -   **Azure App Service:** Ideal para aplicaciones web.
    -   **Azure Container Apps / AKS (Azure Kubernetes Service):** Para contenedores.
    -   **Azure Static Web Apps:** Si la aplicación es principalmente frontend con funciones serverless.
2.  **Base de Datos:** Similar a AWS, ¿dónde residirán los datos? (ej. Azure SQL, Azure Database for PostgreSQL).
3.  **Identidad (Azure AD):** El acceso y los permisos se gestionarán a través de un "Service Principal" en Azure AD. ¿Crearán ustedes el Service Principal o debemos guiarles en el proceso?
4.  **Acceso:** ¿Cómo se nos proporcionará el acceso a la suscripción de Azure?

## 3. Checklist de Acciones

- [ ] Enviar el cuestionario al cliente para recopilar la información necesaria.
- [ ] Una vez recibido, analizar las respuestas y diseñar la arquitectura de despliegue.
- [ ] Dockerizar la aplicación (crear un `Dockerfile`).
- [ ] Escribir los scripts de Infraestructura como Código (IaC) si es necesario.
- [ ] Configurar el pipeline de CI/CD para automatizar los despliegues en los diferentes entornos. 