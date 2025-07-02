import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
  Clock, 
  AlertTriangle, 
  Eye, 
  Settings, 
  Download,
  Smartphone,
  Mail,
  MapPin,
  Activity,
  Lock,
  Unlock,
  Users,
  Server,
  Wifi,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos para configuración de seguridad
interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  passwordHistory: number;
  maxAge: number;
  maxFailedAttempts: number;
}

interface SessionConfig {
  maxDuration: number;
  allowMultipleSessions: boolean;
  autoLogout: boolean;
  rememberMe: boolean;
  idleTimeout: number;
}

interface SecurityAlert {
  id: string;
  type: 'failed_login' | 'new_device' | 'suspicious_activity' | 'policy_violation';
  message: string;
  user?: string;
  ip?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

interface SecurityLog {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  resource?: string;
  ip: string;
  userAgent: string;
  success: boolean;
  details?: string;
}

interface TwoFactorConfig {
  enabled: boolean;
  methods: ('app' | 'sms' | 'email')[];
  requiredForRoles: string[];
  backupCodes: boolean;
}

// Datos mock
const INITIAL_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireNumbers: true,
  requireSymbols: true,
  passwordHistory: 5,
  maxAge: 90,
  maxFailedAttempts: 3
};

const INITIAL_SESSION_CONFIG: SessionConfig = {
  maxDuration: 8,
  allowMultipleSessions: true,
  autoLogout: true,
  rememberMe: true,
  idleTimeout: 30
};

const INITIAL_2FA_CONFIG: TwoFactorConfig = {
  enabled: true,
  methods: ['app', 'email'],
  requiredForRoles: ['admin'],
  backupCodes: true
};

const MOCK_ALERTS: SecurityAlert[] = [
  {
    id: '1',
    type: 'failed_login',
    message: '3 intentos fallidos de login desde IP 192.168.1.100',
    user: 'admin@admin.com',
    ip: '192.168.1.100',
    timestamp: new Date('2024-01-15T09:30:00'),
    severity: 'high',
    resolved: false
  },
  {
    id: '2',
    type: 'new_device',
    message: 'Nuevo dispositivo detectado para usuario admin@admin.com',
    user: 'admin@admin.com',
    ip: '10.0.1.50',
    timestamp: new Date('2024-01-15T08:15:00'),
    severity: 'medium',
    resolved: true
  },
  {
    id: '3',
    type: 'suspicious_activity',
    message: 'Múltiples accesos desde diferentes países en 1 hora',
    user: 'juan@easy.com',
    ip: '203.45.67.89',
    timestamp: new Date('2024-01-14T22:45:00'),
    severity: 'critical',
    resolved: false
  }
];

const MOCK_LOGS: SecurityLog[] = [
  {
    id: '1',
    timestamp: new Date('2024-01-15T09:30:00'),
    user: 'admin@admin.com',
    action: 'Login exitoso',
    ip: '192.168.1.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: true
  },
  {
    id: '2',
    timestamp: new Date('2024-01-15T09:25:00'),
    user: 'admin@admin.com',
    action: 'Acceso a productos',
    resource: '/products',
    ip: '192.168.1.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: true
  },
  {
    id: '3',
    timestamp: new Date('2024-01-15T09:20:00'),
    user: 'juan@easy.com',
    action: 'Intento login fallido',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: false,
    details: 'Contraseña incorrecta'
  },
  {
    id: '4',
    timestamp: new Date('2024-01-15T09:15:00'),
    user: 'maria@jumbo.com',
    action: 'Creó nueva plantilla',
    resource: 'Plantilla promocional',
    ip: '192.168.1.25',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    success: true
  },
  {
    id: '5',
    timestamp: new Date('2024-01-15T09:10:00'),
    user: 'admin@admin.com',
    action: 'Exportó reporte',
    resource: 'Analytics Q4 2023',
    ip: '192.168.1.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: true
  }
];

const getSeverityColor = (severity: SecurityAlert['severity']) => {
  switch (severity) {
    case 'low': return 'bg-blue-100 text-blue-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'critical': return 'bg-red-100 text-red-800';
  }
};

const getSeverityIcon = (severity: SecurityAlert['severity']) => {
  switch (severity) {
    case 'low': return <Activity className="w-4 h-4" />;
    case 'medium': return <Eye className="w-4 h-4" />;
    case 'high': return <AlertTriangle className="w-4 h-4" />;
    case 'critical': return <Shield className="w-4 h-4" />;
  }
};

export const SecuritySettings: React.FC = () => {
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>(INITIAL_PASSWORD_POLICY);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>(INITIAL_SESSION_CONFIG);
  const [twoFactorConfig, setTwoFactorConfig] = useState<TwoFactorConfig>(INITIAL_2FA_CONFIG);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(MOCK_ALERTS);
  const [logs] = useState<SecurityLog[]>(MOCK_LOGS);
  const [activeTab, setActiveTab] = useState<'policies' | 'sessions' | 'alerts' | 'logs' | 'advanced'>('policies');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleResolveAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const handleExportLogs = () => {
    const csv = [
      ['Fecha/Hora', 'Usuario', 'Acción', 'Recurso', 'IP', 'Éxito', 'Detalles'].join(','),
      ...logs.map(log => [
        format(log.timestamp, 'dd/MM/yyyy HH:mm:ss'),
        log.user,
        log.action,
        log.resource || '',
        log.ip,
        log.success ? 'Sí' : 'No',
        log.details || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const unresolvedAlerts = alerts.filter(alert => !alert.resolved);
  const criticalAlerts = unresolvedAlerts.filter(alert => alert.severity === 'critical');

  return (
    <div className="space-y-6">
      {/* Header con métricas rápidas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuración de Seguridad</h2>
          <p className="text-gray-600">Gestiona políticas de seguridad y monitorea actividad</p>
        </div>
        
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
            <div className="text-xs text-gray-500">Alertas Críticas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{unresolvedAlerts.length}</div>
            <div className="text-xs text-gray-500">Alertas Pendientes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{logs.filter(l => l.success).length}</div>
            <div className="text-xs text-gray-500">Accesos Exitosos</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'policies', label: 'Políticas', icon: Key },
            { id: 'sessions', label: 'Sesiones', icon: Clock },
            { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
            { id: 'logs', label: 'Logs', icon: Activity },
            { id: 'advanced', label: 'Avanzado', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de tabs */}
      <div className="space-y-6">
        {activeTab === 'policies' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Políticas de Contraseñas */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Políticas de Contraseñas</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitud mínima
                  </label>
                  <input
                    type="number"
                    value={passwordPolicy.minLength}
                    onChange={(e) => setPasswordPolicy({...passwordPolicy, minLength: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="4"
                    max="50"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={passwordPolicy.requireUppercase}
                      onChange={(e) => setPasswordPolicy({...passwordPolicy, requireUppercase: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Requiere mayúsculas</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={passwordPolicy.requireNumbers}
                      onChange={(e) => setPasswordPolicy({...passwordPolicy, requireNumbers: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Requiere números</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={passwordPolicy.requireSymbols}
                      onChange={(e) => setPasswordPolicy({...passwordPolicy, requireSymbols: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Requiere símbolos</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Historial (contraseñas)
                    </label>
                    <input
                      type="number"
                      value={passwordPolicy.passwordHistory}
                      onChange={(e) => setPasswordPolicy({...passwordPolicy, passwordHistory: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vigencia (días)
                    </label>
                    <input
                      type="number"
                      value={passwordPolicy.maxAge}
                      onChange={(e) => setPasswordPolicy({...passwordPolicy, maxAge: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="365"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intentos fallidos máximos
                  </label>
                  <input
                    type="number"
                    value={passwordPolicy.maxFailedAttempts}
                    onChange={(e) => setPasswordPolicy({...passwordPolicy, maxFailedAttempts: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="10"
                  />
                </div>
              </div>
            </div>

            {/* Autenticación de Dos Factores */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Smartphone className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Autenticación de Dos Factores</h3>
              </div>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={twoFactorConfig.enabled}
                    onChange={(e) => setTwoFactorConfig({...twoFactorConfig, enabled: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Habilitar 2FA</span>
                </label>

                {twoFactorConfig.enabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Métodos disponibles
                      </label>
                      <div className="space-y-2">
                        {[
                          { id: 'app', label: 'Aplicación Autenticadora', icon: Smartphone },
                          { id: 'sms', label: 'SMS', icon: Smartphone },
                          { id: 'email', label: 'Email', icon: Mail }
                        ].map(method => (
                          <label key={method.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={twoFactorConfig.methods.includes(method.id as any)}
                              onChange={(e) => {
                                const methods = e.target.checked
                                  ? [...twoFactorConfig.methods, method.id as any]
                                  : twoFactorConfig.methods.filter(m => m !== method.id);
                                setTwoFactorConfig({...twoFactorConfig, methods});
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <method.icon className="ml-2 w-4 h-4 text-gray-500" />
                            <span className="ml-2 text-sm text-gray-700">{method.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Obligatorio para roles
                      </label>
                      <div className="space-y-2">
                        {['admin', 'editor', 'viewer'].map(role => (
                          <label key={role} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={twoFactorConfig.requiredForRoles.includes(role)}
                              onChange={(e) => {
                                const roles = e.target.checked
                                  ? [...twoFactorConfig.requiredForRoles, role]
                                  : twoFactorConfig.requiredForRoles.filter(r => r !== role);
                                setTwoFactorConfig({...twoFactorConfig, requiredForRoles: roles});
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700 capitalize">{role}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={twoFactorConfig.backupCodes}
                        onChange={(e) => setTwoFactorConfig({...twoFactorConfig, backupCodes: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Códigos de respaldo</span>
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Gestión de Sesiones</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duración máxima de sesión (horas)
                  </label>
                  <input
                    type="number"
                    value={sessionConfig.maxDuration}
                    onChange={(e) => setSessionConfig({...sessionConfig, maxDuration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiempo de inactividad (minutos)
                  </label>
                  <input
                    type="number"
                    value={sessionConfig.idleTimeout}
                    onChange={(e) => setSessionConfig({...sessionConfig, idleTimeout: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="5"
                    max="120"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sessionConfig.allowMultipleSessions}
                    onChange={(e) => setSessionConfig({...sessionConfig, allowMultipleSessions: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Permitir sesiones múltiples</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sessionConfig.autoLogout}
                    onChange={(e) => setSessionConfig({...sessionConfig, autoLogout: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Cierre automático por inactividad</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sessionConfig.rememberMe}
                    onChange={(e) => setSessionConfig({...sessionConfig, rememberMe: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Permitir "Recordar sesión"</span>
                </label>
              </div>
            </div>

            {/* Sesiones activas */}
            <div className="mt-8">
              <h4 className="text-md font-medium text-gray-900 mb-4">Sesiones Activas</h4>
              <div className="space-y-3">
                {[
                  { user: 'admin@admin.com', ip: '192.168.1.10', device: 'Windows - Chrome', lastActivity: '2 minutos', location: 'Buenos Aires, AR' },
                  { user: 'juan@easy.com', ip: '192.168.1.25', device: 'macOS - Safari', lastActivity: '15 minutos', location: 'Córdoba, AR' },
                  { user: 'maria@jumbo.com', ip: '10.0.1.45', device: 'Android - Chrome', lastActivity: '1 hora', location: 'Rosario, AR' }
                ].map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{session.user}</div>
                        <div className="text-sm text-gray-600">{session.device}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {session.location} • {session.ip}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Última actividad:</div>
                      <div className="text-sm font-medium text-gray-900">{session.lastActivity}</div>
                      <button className="text-xs text-red-600 hover:text-red-700 mt-1">
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* Configuración de notificaciones */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Configuración de Alertas</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Mail className="ml-2 w-4 h-4 text-gray-500" />
                    <span className="ml-2 text-sm text-gray-700">Notificaciones por email</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pushNotifications}
                      onChange={(e) => setPushNotifications(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Smartphone className="ml-2 w-4 h-4 text-gray-500" />
                    <span className="ml-2 text-sm text-gray-700">Notificaciones push</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-700">Alertar cuando:</div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>• Más de 3 intentos fallidos de login</div>
                    <div>• Nuevo dispositivo detectado</div>
                    <div>• Acceso desde IP desconocida</div>
                    <div>• Actividad fuera de horario</div>
                    <div>• Múltiples sesiones simultáneas</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de alertas */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Alertas de Seguridad</h3>
                <p className="text-sm text-gray-600">Últimas alertas y eventos de seguridad</p>
              </div>

              <div className="divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-6 ${alert.resolved ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                          {getSeverityIcon(alert.severity)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{alert.message}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {format(alert.timestamp, "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                          </div>
                          {alert.user && (
                            <div className="text-sm text-gray-500 mt-1">
                              Usuario: {alert.user} {alert.ip && `• IP: ${alert.ip}`}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        {!alert.resolved && (
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            Resolver
                          </button>
                        )}
                        {alert.resolved && (
                          <span className="px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-lg">
                            Resuelto
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Logs de Seguridad</h3>
                  <p className="text-sm text-gray-600">Registro detallado de actividad del sistema</p>
                </div>
                <button
                  onClick={handleExportLogs}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-900">Fecha/Hora</th>
                    <th className="text-left p-4 font-medium text-gray-900">Usuario</th>
                    <th className="text-left p-4 font-medium text-gray-900">Acción</th>
                    <th className="text-left p-4 font-medium text-gray-900">Recurso</th>
                    <th className="text-left p-4 font-medium text-gray-900">IP</th>
                    <th className="text-left p-4 font-medium text-gray-900">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm text-gray-900">
                        {format(log.timestamp, 'dd/MM/yyyy HH:mm:ss')}
                      </td>
                      <td className="p-4 text-sm text-gray-900">{log.user}</td>
                      <td className="p-4 text-sm text-gray-900">{log.action}</td>
                      <td className="p-4 text-sm text-gray-600">{log.resource || '—'}</td>
                      <td className="p-4 text-sm text-gray-600">{log.ip}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.success 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.success ? 'Éxito' : 'Fallo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuraciones IP */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Wifi className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Control de Acceso por IP</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IPs Permitidas (Whitelist)
                  </label>
                  <textarea
                    placeholder="192.168.1.0/24&#10;10.0.0.0/8&#10;203.45.67.89"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">Una IP o rango por línea</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IPs Bloqueadas (Blacklist)
                  </label>
                  <textarea
                    placeholder="192.168.1.100&#10;203.45.67.0/24"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bloqueo automático tras múltiples intentos fallidos</span>
                </label>
              </div>
            </div>

            {/* Configuraciones de sistema */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Server className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Configuración del Sistema</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horarios de acceso permitidos
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Desde</label>
                      <input
                        type="time"
                        defaultValue="08:00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                      <input
                        type="time"
                        defaultValue="18:00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Backup automático de base de datos</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Cifrado de datos sensibles</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Integración con Active Directory</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Logs detallados de auditoría</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retención de logs (días)
                  </label>
                  <input
                    type="number"
                    defaultValue="365"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="30"
                    max="2555"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botón de guardar */}
      <div className="flex justify-end">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Guardar Configuración
        </button>
      </div>
    </div>
  );
}; 