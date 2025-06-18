# Modelo de Datos para Servicios Externos

## 1. Objetivo

Este documento define las estructuras de datos (contratos) que la aplicación espera recibir de servicios de terceros. El propósito es claro:
1.  Guiar el desarrollo del backend o de los servicios externos.
2.  Permitir la creación de mocks precisos para el desarrollo del frontend.
3.  Facilitar la transición de datos mockeados a datos reales una vez que los servicios estén disponibles.

## 2. Proceso de Transición de Mocks a Datos Reales

1.  **Desarrollo con Mocks (Obsoleto para Entidades Core):** El desarrollo inicial del frontend utilizó archivos de datos mockeados (ej: `src/data/products.ts`). **Esta práctica debe ser erradicada para entidades críticas como Familias y Plantillas.**
2.  **Política "Supabase-First":** Para toda nueva funcionalidad o CRUD relacionado con Familias y Plantillas, la implementación debe realizarse directamente contra la API de Supabase. **No se deben crear nuevos archivos de mocks para estas entidades.**
3.  **Capa de Abstracción de Datos:** Se debe seguir utilizando una capa de servicio (ej: `src/services/familyService.ts`, `src/services/templateService.ts`) que será la única responsable de obtener los datos. Esta capa debe implementar la lógica para comunicarse con Supabase.
4.  **Integración:** Cuando un servicio real (ej. un ERP externo para productos) esté disponible, solo se modificará la implementación de la capa de servicio para que haga la llamada a la API real, sin necesidad de cambiar los componentes de la UI.

## 3. Definición de Modelos de Datos

A continuación se detallan los objetos y sus campos necesarios. Esta lista debe ser validada y extendida si es necesario.

### 3.1. Producto (`Product`)

Representa un artículo individual que puede ser mostrado en un cartel.

```typescript
interface Product {
  id: string; // SKU o identificador único
  name: string; // Nombre del producto (ej: "Ladrillo Hueco 12x18x33")
  description?: string; // Descripción corta o detalles adicionales
  price: number; // Precio de lista
  offerPrice?: number; // Precio con oferta
  category: string; // Categoría a la que pertenece (ej: "Construcción")
  brand?: string; // Marca del producto
  imageUrl?: string; // URL de la imagen del producto
  stock: number; // Cantidad de stock disponible
  ean?: string; // Código de barras EAN
  // Campos adicionales para financiación
  financingOptions?: FinancingOption[]; // Array de opciones de financiación disponibles
}

interface FinancingOption {
  id: string;
  name: string; // ej: "12 cuotas sin interés"
  cardType: 'credit' | 'debit';
  bank: string; // ej: "Banco Nación"
  interestRate: number; // ej: 0 para sin interés
  installments: number; // ej: 12
}
```

### 3.2. Sucursal (`Branch`)

Representa una tienda o sucursal física.

```typescript
interface Branch {
  id: string | number;
  name: string; // ej: "Easy Pilar"
  address: string;
  city: string;
  state: string;
  country: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}
```

### 3.3. Empresa (`Company`)

Representa la empresa o cadena a la que pertenece el usuario.

```typescript
interface Company {
  id: string | number;
  name: string; // ej: "Cencosud"
  logoUrl?: string;
}
```

## 4. Checklist

- [ ] Validar el modelo `Product` con el equipo de negocio. ¿Faltan campos?
- [ ] Validar el modelo `Branch`.
- [ ] Crear la capa de servicios para `Product` que consuma los datos mockeados.
- [x] **Establecer como política obligatoria el uso de Supabase para Familias y Plantillas, eliminando los mocks existentes.**
- [ ] Preparar la infraestructura para que en el futuro no se usen más los mocks para el resto de las entidades (Productos, etc.).
- [ ] Definir los endpoints de la API esperados (ej: `GET /api/products`, `GET /api/products/:id`). 