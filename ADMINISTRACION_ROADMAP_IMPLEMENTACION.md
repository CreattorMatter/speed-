# 🛡️ ROADMAP: IMPLEMENTACIÓN REAL DEL SISTEMA DE ADMINISTRACIÓN Y SEGURIDAD

## 📋 **ESTADO ACTUAL**

### ✅ **LO QUE YA FUNCIONA (Frontend Completo)**
- **Componentes React**: Todos los componentes de UI funcionan perfectamente
- **Navegación**: Tabs, modales, formularios interactivos
- **Validaciones frontend**: Inputs, checkboxes, formularios complejos
- **Animaciones**: Framer-motion implementado
- **Diseño responsive**: Mobile y desktop
- **Estados locales**: Gestión de estado en memoria
- **Exportación CSV**: De datos mock
- **UX completa**: Dashboard, roles, permisos, configuración de seguridad

### ❌ **LO QUE ES SIMULADO (Necesita implementación real)**
- **Backend**: No hay APIs REST conectadas
- **Base de datos**: Datos mock que no persisten
- **Autenticación real**: JWT/OAuth
- **Autorización por roles**: Verificación real de permisos
- **2FA**: Sistema de autenticación de dos factores
- **Monitoreo**: Logs y alertas reales
- **Geolocalización**: Tracking de IPs y ubicaciones
- **Notificaciones**: Email/SMS reales

---

## 🚀 **PLAN DE IMPLEMENTACIÓN**

### **ESTIMACIÓN TOTAL: 6-8 semanas de desarrollo**

---

## 🎯 **FASE 1: BASE DE DATOS Y BACKEND BÁSICO** 
**⏱️ Tiempo: 1-2 semanas | 🔴 Prioridad: CRÍTICA**

### **1.1 Crear Tablas en Supabase**

```sql
-- Tabla de roles del sistema
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]',
  is_custom BOOLEAN DEFAULT true,
  color VARCHAR(7) DEFAULT '#6366F1',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Relación usuarios-roles
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Logs de seguridad
CREATE TABLE security_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  location JSONB, -- {city, country, latitude, longitude}
  success BOOLEAN DEFAULT true,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Alertas de seguridad
CREATE TABLE security_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL, -- 'failed_login', 'new_device', 'suspicious_activity', 'policy_violation'
  severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
  user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  ip_address INET,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Sesiones activas
CREATE TABLE active_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  device_info JSONB,
  location JSONB,
  last_activity TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Configuraciones de seguridad
CREATE TABLE security_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Políticas de contraseñas
CREATE TABLE password_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  min_length INTEGER DEFAULT 8,
  require_uppercase BOOLEAN DEFAULT true,
  require_numbers BOOLEAN DEFAULT true,
  require_symbols BOOLEAN DEFAULT true,
  password_history INTEGER DEFAULT 5,
  max_age INTEGER DEFAULT 90, -- días
  max_failed_attempts INTEGER DEFAULT 3,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar roles predefinidos
INSERT INTO roles (name, display_name, description, is_custom, color, permissions) VALUES
('admin', 'Administrador', 'Acceso total a todas las funciones del sistema', false, '#EF4444', 
 '["dashboard.view", "products.view", "products.create", "products.edit", "products.delete", "products.export", "promotions.view", "promotions.create", "promotions.edit", "promotions.delete", "posters.view", "posters.create", "posters.edit", "posters.print", "posters.digital", "templates.view", "templates.create", "templates.edit", "templates.delete", "families.manage", "analytics.view", "analytics.export", "admin.users", "admin.roles", "admin.security", "admin.system"]'),
('editor', 'Editor', 'Puede crear y editar plantillas y carteles', false, '#3B82F6',
 '["dashboard.view", "products.view", "products.export", "promotions.view", "promotions.create", "promotions.edit", "posters.view", "posters.create", "posters.edit", "posters.print", "templates.view", "templates.create", "templates.edit"]'),
('viewer', 'Visualizador', 'Solo puede ver carteles y plantillas', false, '#10B981',
 '["dashboard.view", "products.view", "promotions.view", "posters.view", "templates.view"]'),
('sucursal', 'Sucursal', 'Gestión limitada para sucursales específicas', false, '#F59E0B',
 '["dashboard.view", "products.view", "promotions.view", "posters.view", "posters.print"]');

-- Insertar configuración inicial de seguridad
INSERT INTO password_policies (min_length, require_uppercase, require_numbers, require_symbols, password_history, max_age, max_failed_attempts) 
VALUES (8, true, true, true, 5, 90, 3);
```

### **1.2 Servicios Backend a Crear**

```typescript
// src/services/adminService.ts
export class AdminService {
  // Gestión de Roles
  async getRoles(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async createRole(role: Omit<Role, 'id' | 'created_at'>): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .insert([role])
      .select()
      .single();
    
    if (error) throw error;
    await this.logSecurityEvent('CREATE_ROLE', role.name);
    return data;
  }

  async updateRole(id: string, updates: Partial<Role>): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    await this.logSecurityEvent('UPDATE_ROLE', id);
    return data;
  }

  async deleteRole(id: string): Promise<void> {
    // Verificar que no hay usuarios asignados
    const { count } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', id);
    
    if (count && count > 0) {
      throw new Error('Cannot delete role with assigned users');
    }

    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    await this.logSecurityEvent('DELETE_ROLE', id);
  }

  // Gestión de Usuarios
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('auth.users')
      .select(`
        *,
        user_roles (
          role:roles (*)
        )
      `);
    
    if (error) throw error;
    return data;
  }

  async updateUserRole(userId: string, roleId: string): Promise<void> {
    // Eliminar roles existentes
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    // Asignar nuevo rol
    const { error } = await supabase
      .from('user_roles')
      .insert([{
        user_id: userId,
        role_id: roleId,
        assigned_by: (await supabase.auth.getUser()).data.user?.id
      }]);
    
    if (error) throw error;
    await this.logSecurityEvent('UPDATE_USER_ROLE', `${userId}:${roleId}`);
  }

  // Logging de Seguridad
  async logSecurityEvent(action: string, resource?: string): Promise<void> {
    const user = (await supabase.auth.getUser()).data.user;
    const location = await this.getLocationFromIP();
    
    const { error } = await supabase
      .from('security_logs')
      .insert([{
        user_id: user?.id,
        action,
        resource,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        location,
        success: true
      }]);
    
    if (error) console.error('Failed to log security event:', error);
  }

  async getSecurityLogs(filters?: LogFilters): Promise<SecurityLog[]> {
    let query = supabase
      .from('security_logs')
      .select(`
        *,
        user:auth.users(email, raw_user_meta_data)
      `)
      .order('created_at', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    const { data, error } = await query.limit(100);
    if (error) throw error;
    return data;
  }

  // Utilities
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  private async getLocationFromIP(): Promise<any> {
    try {
      const response = await fetch('http://ip-api.com/json/');
      return await response.json();
    } catch {
      return { city: 'Unknown', country: 'Unknown' };
    }
  }
}
```

### **1.3 Actualizar Componentes para usar APIs Reales**

```typescript
// Actualizar src/features/settings/components/RolesAndPermissions.tsx
export const RolesAndPermissions: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const adminService = new AdminService();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await adminService.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Error al cargar roles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (roleData: Omit<Role, 'id' | 'created_at'>) => {
    try {
      const newRole = await adminService.createRole(roleData);
      setRoles([...roles, newRole]);
      toast.success('Rol creado exitosamente');
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Error al crear rol');
    }
  };

  // ... resto de métodos reales
};
```

---

## 🔐 **FASE 2: AUTENTICACIÓN Y AUTORIZACIÓN REAL**
**⏱️ Tiempo: 1 semana | 🔴 Prioridad: CRÍTICA**

### **2.1 Hook de Permisos Real**

```typescript
// src/hooks/usePermissions.ts
export const usePermissions = () => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPermissions();
  }, []);

  const loadUserPermissions = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          role:roles (permissions)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const allPermissions = data.flatMap(ur => ur.role.permissions);
      setPermissions([...new Set(allPermissions)]);
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const requirePermission = (permission: string) => {
    if (!checkPermission(permission)) {
      throw new Error(`Insufficient permissions: ${permission}`);
    }
  };

  const hasAnyPermission = (perms: string[]): boolean => {
    return perms.some(p => permissions.includes(p));
  };

  return { 
    permissions, 
    loading, 
    checkPermission, 
    requirePermission, 
    hasAnyPermission 
  };
};
```

### **2.2 Componente de Protección de Rutas**

```typescript
// src/components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredPermissions,
  fallback = <UnauthorizedPage />
}) => {
  const { checkPermission, hasAnyPermission, loading } = usePermissions();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Verificar permiso único
  if (requiredPermission && !checkPermission(requiredPermission)) {
    return fallback;
  }

  // Verificar múltiples permisos (cualquiera)
  if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
    return fallback;
  }

  return <>{children}</>;
};

// Uso en rutas:
<Route
  path="/administration"
  element={
    <ProtectedRoute requiredPermission="admin.access">
      <Administration />
    </ProtectedRoute>
  }
/>
```

### **2.3 Middleware de Logging Automático**

```typescript
// src/middleware/securityLogger.ts
export const withSecurityLogging = <T extends (...args: any[]) => any>(
  fn: T,
  action: string,
  getResource?: (...args: Parameters<T>) => string
): T => {
  return ((...args: Parameters<T>) => {
    const adminService = new AdminService();
    const resource = getResource ? getResource(...args) : undefined;
    
    try {
      const result = fn(...args);
      
      // Log successful action
      adminService.logSecurityEvent(action, resource);
      
      return result;
    } catch (error) {
      // Log failed action
      adminService.logSecurityEvent(`${action}_FAILED`, resource);
      throw error;
    }
  }) as T;
};

// Uso en componentes:
const handleDeleteUser = withSecurityLogging(
  async (userId: string) => {
    await adminService.deleteUser(userId);
  },
  'DELETE_USER',
  (userId) => userId
);
```

---

## 🚨 **FASE 3: MONITOREO Y ALERTAS REALES**
**⏱️ Tiempo: 1-2 semanas | 🟡 Prioridad: ALTA**

### **3.1 Sistema de Alertas Automático**

```typescript
// src/services/alertService.ts
export class AlertService {
  async checkFailedLoginAttempts(userId: string): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const { count } = await supabase
      .from('security_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('action', 'LOGIN_FAILED')
      .gte('created_at', oneHourAgo.toISOString());

    if (count && count >= 3) {
      await this.createAlert({
        type: 'failed_login',
        severity: 'high',
        user_id: userId,
        message: `${count} intentos fallidos de login en la última hora`,
        metadata: { attempt_count: count }
      });
    }
  }

  async detectSuspiciousActivity(): Promise<void> {
    // Detectar múltiples ubicaciones en poco tiempo
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    const { data } = await supabase
      .from('security_logs')
      .select('user_id, location')
      .gte('created_at', twoHoursAgo.toISOString())
      .not('location', 'is', null);

    // Agrupar por usuario y detectar múltiples países
    const userLocations = data?.reduce((acc, log) => {
      if (!acc[log.user_id]) acc[log.user_id] = new Set();
      acc[log.user_id].add(log.location.country);
      return acc;
    }, {} as Record<string, Set<string>>);

    for (const [userId, countries] of Object.entries(userLocations || {})) {
      if (countries.size > 1) {
        await this.createAlert({
          type: 'suspicious_activity',
          severity: 'critical',
          user_id: userId,
          message: 'Accesos desde múltiples países detectados',
          metadata: { countries: Array.from(countries) }
        });
      }
    }
  }

  async createAlert(alertData: Omit<SecurityAlert, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('security_alerts')
      .insert([alertData]);

    if (error) throw error;

    // Enviar notificación si es crítica
    if (alertData.severity === 'critical') {
      await this.notifyAdmins(alertData);
    }
  }

  private async notifyAdmins(alert: Omit<SecurityAlert, 'id' | 'created_at'>): Promise<void> {
    // Obtener admins
    const { data: admins } = await supabase
      .from('user_roles')
      .select(`
        user:auth.users(email),
        role:roles(name)
      `)
      .eq('roles.name', 'admin');

    // Enviar emails (implementar en Fase 5)
    for (const admin of admins || []) {
      // await EmailService.sendSecurityAlert(alert, admin.user.email);
    }
  }
}
```

### **3.2 Componente de Monitoreo en Tiempo Real**

```typescript
// src/hooks/useRealTimeAlerts.ts
export const useRealTimeAlerts = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);

  useEffect(() => {
    // Suscripción en tiempo real a nuevas alertas
    const subscription = supabase
      .channel('security_alerts')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'security_alerts' },
        (payload) => {
          setAlerts(prev => [payload.new as SecurityAlert, ...prev]);
          
          // Mostrar notificación toast para alertas críticas
          if (payload.new.severity === 'critical') {
            toast.error(`🚨 ${payload.new.message}`, { duration: 10000 });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { alerts };
};
```

---

## 🌍 **FASE 4: GEOLOCALIZACIÓN Y SESIONES REALES**
**⏱️ Tiempo: 1 semana | 🟡 Prioridad: ALTA**

### **4.1 Gestión de Sesiones Reales**

```typescript
// src/services/sessionService.ts
export class SessionService {
  async createSession(userId: string): Promise<Session> {
    const location = await this.getLocationFromIP();
    const deviceInfo = this.getDeviceInfo();
    
    const sessionData = {
      user_id: userId,
      session_token: this.generateSessionToken(),
      ip_address: await this.getClientIP(),
      user_agent: navigator.userAgent,
      device_info: deviceInfo,
      location,
      expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 horas
    };

    const { data, error } = await supabase
      .from('active_sessions')
      .insert([sessionData])
      .select()
      .single();

    if (error) throw error;
    
    // Almacenar token en localStorage
    localStorage.setItem('session_token', data.session_token);
    
    return data;
  }

  async getActiveSessions(): Promise<Session[]> {
    const { data, error } = await supabase
      .from('active_sessions')
      .select(`
        *,
        user:auth.users(email, raw_user_meta_data)
      `)
      .gt('expires_at', new Date().toISOString())
      .order('last_activity', { ascending: false });

    if (error) throw error;
    return data;
  }

  async terminateSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('active_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
  }

  async updateSessionActivity(sessionToken: string): Promise<void> {
    const { error } = await supabase
      .from('active_sessions')
      .update({ last_activity: new Date() })
      .eq('session_token', sessionToken);

    if (error) console.error('Failed to update session activity:', error);
  }

  private async getLocationFromIP(): Promise<any> {
    try {
      const response = await fetch('http://ip-api.com/json/');
      const data = await response.json();
      return {
        city: data.city,
        country: data.country,
        latitude: data.lat,
        longitude: data.lon
      };
    } catch {
      return { city: 'Unknown', country: 'Unknown' };
    }
  }

  private getDeviceInfo(): any {
    const ua = navigator.userAgent;
    return {
      browser: this.getBrowserInfo(ua),
      os: this.getOSInfo(ua),
      mobile: /Mobile|Android|iPhone|iPad/.test(ua)
    };
  }

  private getBrowserInfo(ua: string): string {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    return 'Unknown';
  }

  private getOSInfo(ua: string): string {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private generateSessionToken(): string {
    return crypto.randomUUID();
  }
}
```

---

## 📧 **FASE 5: NOTIFICACIONES REALES**
**⏱️ Tiempo: 1 semana | 🟢 Prioridad: MEDIA**

### **5.1 Servicio de Email**

```typescript
// src/services/emailService.ts
export class EmailService {
  private static readonly SENDGRID_API_KEY = process.env.VITE_SENDGRID_API_KEY;
  private static readonly FROM_EMAIL = 'security@spid.com';

  static async sendSecurityAlert(alert: SecurityAlert, adminEmail: string): Promise<void> {
    const emailData = {
      to: adminEmail,
      from: this.FROM_EMAIL,
      subject: `🚨 Alerta de Seguridad SPID: ${alert.type}`,
      html: this.generateAlertHTML(alert)
    };

    // Integración con SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }
  }

  static async send2FACode(userEmail: string, code: string): Promise<void> {
    const emailData = {
      to: userEmail,
      from: this.FROM_EMAIL,
      subject: 'Código de verificación SPID',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Código de Verificación</h2>
          <p>Tu código de verificación es:</p>
          <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
            ${code}
          </div>
          <p>Este código expira en 10 minutos.</p>
        </div>
      `
    };

    // Enviar usando la misma lógica de SendGrid
  }

  private static generateAlertHTML(alert: SecurityAlert): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${this.getSeverityColor(alert.severity)}; color: white; padding: 20px;">
          <h1>🚨 Alerta de Seguridad</h1>
        </div>
        <div style="padding: 20px;">
          <h2>${alert.message}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td><strong>Tipo:</strong></td><td>${alert.type}</td></tr>
            <tr><td><strong>Severidad:</strong></td><td>${alert.severity}</td></tr>
            <tr><td><strong>Fecha:</strong></td><td>${new Date(alert.created_at).toLocaleString()}</td></tr>
            ${alert.ip_address ? `<tr><td><strong>IP:</strong></td><td>${alert.ip_address}</td></tr>` : ''}
          </table>
          <a href="https://spid.com/administration" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
            Ver en Dashboard
          </a>
        </div>
      </div>
    `;
  }

  private static getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#DC2626';
      case 'high': return '#EA580C';
      case 'medium': return '#D97706';
      case 'low': return '#059669';
      default: return '#6B7280';
    }
  }
}
```

### **5.2 Servicio de SMS (2FA)**

```typescript
// src/services/smsService.ts
export class SMSService {
  private static readonly TWILIO_SID = process.env.VITE_TWILIO_SID;
  private static readonly TWILIO_TOKEN = process.env.VITE_TWILIO_TOKEN;
  private static readonly TWILIO_PHONE = process.env.VITE_TWILIO_PHONE;

  static async send2FACode(phoneNumber: string, code: string): Promise<void> {
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.TWILIO_SID}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('To', phoneNumber);
    formData.append('From', this.TWILIO_PHONE);
    formData.append('Body', `Tu código de verificación SPID es: ${code}. Expira en 10 minutos.`);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${this.TWILIO_SID}:${this.TWILIO_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to send SMS: ${response.statusText}`);
    }
  }
}
```

---

## ⚙️ **FASE 6: CONFIGURACIONES AVANZADAS**
**⏱️ Tiempo: 1 semana | 🟢 Prioridad: BAJA**

### **6.1 Servicio de Backup Automático**

```typescript
// src/services/backupService.ts
export class BackupService {
  static async scheduleBackup(): Promise<void> {
    // Ejecutar backup cada 24 horas
    setInterval(async () => {
      try {
        await this.createBackup();
      } catch (error) {
        console.error('Backup failed:', error);
      }
    }, 24 * 60 * 60 * 1000);
  }

  private static async createBackup(): Promise<void> {
    const timestamp = new Date().toISOString();
    
    // Backup de configuraciones críticas
    const backupData = {
      timestamp,
      roles: await this.exportRoles(),
      users: await this.exportUsers(),
      security_settings: await this.exportSecuritySettings(),
      password_policies: await this.exportPasswordPolicies()
    };

    // Guardar en Supabase Storage
    const { error } = await supabase.storage
      .from('backups')
      .upload(`backup-${timestamp}.json`, JSON.stringify(backupData, null, 2));

    if (error) throw error;

    // Limpiar backups antiguos (mantener solo últimos 30 días)
    await this.cleanOldBackups();
  }

  private static async exportRoles(): Promise<any[]> {
    const { data } = await supabase.from('roles').select('*');
    return data || [];
  }

  private static async exportUsers(): Promise<any[]> {
    const { data } = await supabase
      .from('user_roles')
      .select(`
        user:auth.users(email, raw_user_meta_data),
        role:roles(name)
      `);
    return data || [];
  }

  private static async exportSecuritySettings(): Promise<any[]> {
    const { data } = await supabase.from('security_settings').select('*');
    return data || [];
  }

  private static async exportPasswordPolicies(): Promise<any[]> {
    const { data } = await supabase.from('password_policies').select('*');
    return data || [];
  }

  private static async cleanOldBackups(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const { data: files } = await supabase.storage
      .from('backups')
      .list();

    const oldFiles = files?.filter(file => 
      new Date(file.created_at) < thirtyDaysAgo
    ) || [];

    for (const file of oldFiles) {
      await supabase.storage
        .from('backups')
        .remove([file.name]);
    }
  }
}
```

### **6.2 Integración con Active Directory (Opcional)**

```typescript
// src/services/ldapService.ts
export class LDAPService {
  private static readonly LDAP_URL = process.env.VITE_LDAP_URL;
  private static readonly LDAP_BASE_DN = process.env.VITE_LDAP_BASE_DN;

  static async authenticateUser(username: string, password: string): Promise<boolean> {
    // Esta sería una implementación con un backend que maneje LDAP
    // El frontend no puede conectarse directamente a LDAP por seguridad
    
    const response = await fetch('/api/auth/ldap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    return response.ok;
  }

  static async syncUsers(): Promise<void> {
    // Sincronización automática con AD
    const response = await fetch('/api/users/sync-ldap', {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error('Failed to sync LDAP users');
    }
  }
}
```

---

## 📊 **RESUMEN DE IMPLEMENTACIÓN**

### **Orden de Prioridades**

| **Fase** | **Componente** | **Complejidad** | **Tiempo** | **Prioridad** | **Dependencias** |
|----------|----------------|-----------------|------------|---------------|------------------|
| 1 | Base de Datos + APIs | 🟡 Media | 1-2 sem | 🔴 Crítica | Supabase |
| 2 | Autenticación/Autorización | 🟡 Media | 1 sem | 🔴 Crítica | Fase 1 |
| 3 | Monitoreo/Alertas | 🔴 Alta | 1-2 sem | 🟡 Alta | Fase 1,2 |
| 4 | Geolocalización/Sesiones | 🟢 Baja | 1 sem | 🟡 Alta | Fase 1 |
| 5 | Notificaciones | 🟡 Media | 1 sem | 🟢 Media | APIs externas |
| 6 | Configuraciones Avanzadas | 🔴 Alta | 1 sem | 🟢 Baja | Opcional |

### **Tecnologías Necesarias**

```bash
# Dependencias adicionales a instalar
npm install @sendgrid/mail twilio
npm install @types/node  # Para tipos de Node.js
```

### **Variables de Entorno**

```env
# .env.local
VITE_SENDGRID_API_KEY=tu_api_key_sendgrid
VITE_TWILIO_SID=tu_twilio_sid
VITE_TWILIO_TOKEN=tu_twilio_token
VITE_TWILIO_PHONE=+1234567890
VITE_LDAP_URL=ldap://tu-servidor.com
VITE_LDAP_BASE_DN=dc=empresa,dc=com
```

---

## 🚀 **PRÓXIMOS PASOS RECOMENDADOS**

### **Semana 1-2: Fundación**
1. ✅ Crear todas las tablas en Supabase
2. ✅ Implementar `AdminService` completo
3. ✅ Conectar componentes React a APIs reales
4. ✅ Agregar manejo de errores y loading states

### **Semana 3: Seguridad**
1. ✅ Implementar `usePermissions` hook
2. ✅ Crear `ProtectedRoute` component
3. ✅ Agregar logging automático
4. ✅ Testing de autorización

### **Semana 4-5: Monitoreo**
1. ✅ Implementar `AlertService`
2. ✅ Sistema de alertas en tiempo real
3. ✅ Dashboard con métricas reales
4. ✅ Detección de actividad sospechosa

### **Semana 6: Sesiones y Ubicación**
1. ✅ `SessionService` completo
2. ✅ Tracking de geolocalización
3. ✅ Gestión de sesiones activas
4. ✅ Control de acceso por IP

### **Semana 7: Notificaciones**
1. ✅ Integración con SendGrid
2. ✅ Sistema 2FA por SMS/Email
3. ✅ Alertas por email
4. ✅ Testing de notificaciones

### **Semana 8: Pulimiento**
1. ✅ Backup automático
2. ✅ Configuraciones avanzadas
3. ✅ Optimización de performance
4. ✅ Testing completo del sistema

---

## 🎯 **CRITERIOS DE ÉXITO**

Al finalizar la implementación, el sistema deberá:

- [ ] **Persistir datos**: Todos los cambios se guardan en Supabase
- [ ] **Autenticar usuarios**: Login real con roles y permisos
- [ ] **Autorizar acciones**: Verificación real de permisos por módulo
- [ ] **Registrar actividad**: Logs automáticos de todas las acciones
- [ ] **Detectar amenazas**: Alertas automáticas por actividad sospechosa
- [ ] **Rastrear ubicaciones**: Geolocalización real de accesos
- [ ] **Gestionar sesiones**: Control de sesiones activas
- [ ] **Notificar eventos**: Emails/SMS automáticos
- [ ] **Backup datos**: Respaldo automático de configuraciones
- [ ] **Exportar reportes**: CSV con datos reales

---

## 💡 **NOTAS IMPORTANTES**

### **Consideraciones de Seguridad**
- Las APIs de terceros (SendGrid, Twilio) requieren keys secretas
- La geolocalización por IP puede tener limitaciones de rate-limit
- Los backups automáticos pueden generar muchos archivos
- LDAP requiere backend dedicado (no desde frontend)

### **Optimizaciones Recomendadas**
- Implementar cache en Redis para sesiones activas
- Usar índices en tablas para queries rápidas
- Comprimir logs antiguos para ahorrar espacio
- Implementar rate limiting en APIs sensibles

### **Testing Sugerido**
- Unit tests para todos los servicios
- Integration tests para flujos completos
- Security tests para validar permisos
- Performance tests para queries complejas

---

**📅 Fecha de creación**: Diciembre 2024  
**📝 Versión**: 1.0  
**👤 Autor**: Sistema de desarrollo SPID Plus  
**🔄 Próxima revisión**: Al completar Fase 1

---

> **💬 Comentario Final**: Este roadmap representa aproximadamente **6-8 semanas** de desarrollo dedicado para convertir el sistema de administración mock en una solución completamente funcional y segura. La base frontend ya está sólida, por lo que el enfoque será principalmente en backend, integración de APIs y testing exhaustivo.
</rewritten_file> 