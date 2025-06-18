# Sistema de Solicitud de Modificación con Autenticación 2FA

## 1. Objetivo

Este documento detalla el sistema de solicitud de modificación para usuarios de sucursal que necesitan realizar cambios en carteles o productos, pero requieren autorización adicional mediante autenticación de dos factores (2FA).

## 2. Contexto del Requerimiento

Según el pedido original, cuando un usuario de sucursal (no administrador) necesita modificar un cartel o producto, debe:

1. **Solicitar modificación** en lugar de poder editarlo directamente
2. **Generar un token de autenticación** 2FA 
3. **Enviar la solicitud** al administrador con el token
4. **Obtener aprobación** para proceder con la modificación

## 3. Flujo de Usuario Propuesto

### 3.1. Escenario: Usuario de Sucursal Intenta Modificar

```mermaid
graph TD
    A[Usuario intenta modificar cartel] --> B{¿Tiene permisos de edición?}
    B -->|NO| C[Mostrar: "Sin permisos"]
    B -->|SÍ| D{¿Requiere 2FA?}
    D -->|NO| E[Permitir edición directa]
    D -->|SÍ| F[Mostrar modal: "Requiere autenticación 2FA"]
    F --> G[Usuario selecciona método 2FA]
    G --> H[Generar token]
    H --> I[Enviar solicitud al administrador]
    I --> J[Administrador recibe notificación]
    J --> K{¿Administrador aprueba?}
    K -->|SÍ| L[Usuario puede proceder con modificación]
    K -->|NO| M[Solicitud denegada]
```

### 3.2. Flujo Detallado Paso a Paso

1. **Detección de Acción Restringida:**
   ```typescript
   // Usuario hace clic en "Editar Producto"
   onEditProduct() {
     if (!user.hasPermission('product:edit')) {
       showMessage("No tienes permisos para editar productos");
       return;
     }
     
     if (requiresTwoFactorAuth(user, 'product:edit')) {
       showTwoFactorModal();
     } else {
       allowDirectEdit();
     }
   }
   ```

2. **Modal de Autenticación 2FA:**
   - Opciones disponibles:
     - Microsoft Authenticator (si empresa usa Microsoft)
     - Google Authenticator
     - Token SMS (backup)

3. **Generación de Token:**
   ```typescript
   interface ModificationRequest {
     id: string;
     userId: string;
     action: 'edit_product' | 'edit_poster' | 'delete_item';
     targetId: string; // ID del producto/cartel a modificar
     twoFactorToken: string;
     timestamp: Date;
     status: 'pending' | 'approved' | 'denied';
     adminNotes?: string;
   }
   ```

4. **Notificación al Administrador:**
   - Email con detalles de la solicitud
   - Notificación en la interfaz de administración
   - Link directo para aprobar/denegar

5. **Respuesta del Administrador:**
   - Vista de solicitudes pendientes
   - Información del usuario solicitante
   - Detalles de la modificación propuesta
   - Verificación del token 2FA

## 4. Opciones de Implementación 2FA

### 4.1. Integración con Proveedor Corporativo (Recomendado)

**Si la empresa usa Microsoft 365:**
```typescript
// Usar Microsoft Authenticator API
const tokenRequest = {
  scopes: ['user.read'],
  account: account,
  forceRefresh: false
};

const response = await msalInstance.acquireTokenSilent(tokenRequest);
```

**Si la empresa usa Google Workspace:**
```typescript
// Usar Google Authenticator
const credential = await navigator.credentials.get({
  otp: { transport: ['sms', 'voice'] },
  signal: controller.signal
});
```

### 4.2. Implementación con TOTP (Alternativa)

```typescript
import { authenticator } from 'otplib';

// Generar secret para el usuario
const secret = authenticator.generateSecret();

// Verificar token
const isValid = authenticator.verify({
  token: userInputToken,
  secret: userSecret
});
```

## 5. Base de Datos - Esquema Propuesto

```sql
-- Tabla para almacenar solicitudes de modificación
CREATE TABLE modification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL, -- 'product', 'poster', etc.
    two_factor_token VARCHAR(255),
    token_method VARCHAR(50), -- 'microsoft', 'google', 'totp'
    request_details JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    admin_id UUID REFERENCES users(id),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Tabla para configuración 2FA por usuario
CREATE TABLE user_two_factor_config (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    method VARCHAR(50) NOT NULL, -- 'microsoft', 'google', 'totp'
    secret VARCHAR(255), -- Para TOTP
    backup_codes TEXT[], -- Códigos de respaldo
    is_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used TIMESTAMP
);
```

## 6. Interfaz de Usuario

### 6.1. Modal de Solicitud 2FA

```typescript
interface TwoFactorModalProps {
  actionType: string;
  targetItem: any;
  onSuccess: (token: string) => void;
  onCancel: () => void;
}

const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  actionType,
  targetItem,
  onSuccess,
  onCancel
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'microsoft' | 'google' | 'totp'>('microsoft');
  const [token, setToken] = useState('');
  
  return (
    <Modal>
      <h3>Autenticación Requerida</h3>
      <p>Para {actionType}, necesitas autorización adicional.</p>
      
      <div className="auth-methods">
        <button 
          onClick={() => setSelectedMethod('microsoft')}
          className={selectedMethod === 'microsoft' ? 'active' : ''}
        >
          Microsoft Authenticator
        </button>
        <button 
          onClick={() => setSelectedMethod('google')}
          className={selectedMethod === 'google' ? 'active' : ''}
        >
          Google Authenticator
        </button>
        <button 
          onClick={() => setSelectedMethod('totp')}
          className={selectedMethod === 'totp' ? 'active' : ''}
        >
          Código TOTP
        </button>
      </div>
      
      {selectedMethod === 'totp' && (
        <input
          type="text"
          placeholder="Ingresa el código de 6 dígitos"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          maxLength={6}
        />
      )}
      
      <div className="actions">
        <button onClick={onCancel}>Cancelar</button>
        <button onClick={() => handleSubmit()}>Solicitar Autorización</button>
      </div>
    </Modal>
  );
};
```

### 6.2. Panel de Administrador - Solicitudes Pendientes

```typescript
const AdminRequestsPanel = () => {
  const [requests, setRequests] = useState<ModificationRequest[]>([]);
  
  return (
    <div className="admin-requests">
      <h2>Solicitudes de Modificación Pendientes</h2>
      
      {requests.map(request => (
        <div key={request.id} className="request-card">
          <div className="request-header">
            <span className="user">{request.user.name}</span>
            <span className="action">{request.action}</span>
            <span className="timestamp">{formatTime(request.timestamp)}</span>
          </div>
          
          <div className="request-details">
            <p><strong>Quiere:</strong> {request.action}</p>
            <p><strong>Item:</strong> {request.targetId}</p>
            <p><strong>2FA:</strong> ✅ Verificado ({request.tokenMethod})</p>
          </div>
          
          <div className="request-actions">
            <button 
              className="approve"
              onClick={() => approveRequest(request.id)}
            >
              Aprobar
            </button>
            <button 
              className="deny"
              onClick={() => denyRequest(request.id)}
            >
              Denegar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
```

## 7. Configuración Requerida del Cliente

Para implementar este sistema, necesitamos del cliente:

### 7.1. Si usan Microsoft 365:
- **App Registration** en Azure AD
- **Client ID** y **Tenant ID**
- **Permisos** para Microsoft Authenticator API
- **Redirect URIs** configuradas

### 7.2. Si usan Google Workspace:
- **Proyecto** en Google Cloud Console
- **OAuth 2.0 Client ID**
- **API Key** para Google Authenticator
- **Dominios autorizados**

### 7.3. Alternativa TOTP:
- Solo requiere configuración en nuestra aplicación
- Usuarios deben instalar app authenticator (Google/Microsoft/Authy)

## 8. Checklist de Implementación

- [ ] **Definir acciones que requieren 2FA**
  - [ ] Editar productos
  - [ ] Modificar carteles
  - [ ] Eliminar elementos
  - [ ] Otras acciones críticas

- [ ] **Implementar modal de autenticación 2FA**
  - [ ] Integración Microsoft Authenticator
  - [ ] Integración Google Authenticator  
  - [ ] Fallback TOTP manual

- [ ] **Crear sistema de solicitudes**
  - [ ] API endpoints para crear/gestionar solicitudes
  - [ ] Base de datos schema
  - [ ] Sistema de notificaciones

- [ ] **Panel de administrador**
  - [ ] Vista de solicitudes pendientes
  - [ ] Funcionalidad aprobar/denegar
  - [ ] Histórico de solicitudes

- [ ] **Configuración cliente**
  - [ ] Obtener información de configuración
  - [ ] Configurar integración elegida
  - [ ] Pruebas en entorno de desarrollo

## 9. Consideraciones de Seguridad

- **Expiración de tokens:** 30 minutos máximo
- **Rate limiting:** Máximo 3 intentos por hora por usuario
- **Logs de auditoría:** Registrar todas las solicitudes y respuestas
- **Encriptación:** Tokens almacenados encriptados en base de datos
- **Backup codes:** Proporcionar códigos de respaldo para emergencias

---
**Estado:** ❌ Pendiente de implementación
**Dependencias:** Información de configuración del cliente (Microsoft/Google) 