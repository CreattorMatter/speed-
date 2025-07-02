import React from 'react';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  Eye, 
  Clock,
  Activity,
  MapPin,
  Smartphone,
  Lock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SecurityMetric {
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative';
  icon: React.ReactNode;
  color: string;
}

interface SecurityDashboardProps {
  className?: string;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ className = '' }) => {
  const metrics: SecurityMetric[] = [
    {
      label: 'Alertas Críticas',
      value: 2,
      change: -1,
      changeType: 'positive',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'from-red-500 to-red-600'
    },
    {
      label: 'Sesiones Activas',
      value: 12,
      change: 3,
      changeType: 'negative',
      icon: <Users className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Intentos Fallidos (24h)',
      value: 8,
      change: -5,
      changeType: 'positive',
      icon: <Lock className="w-5 h-5" />,
      color: 'from-orange-500 to-orange-600'
    },
    {
      label: 'Usuarios con 2FA',
      value: '78%',
      change: 12,
      changeType: 'positive',
      icon: <Smartphone className="w-5 h-5" />,
      color: 'from-green-500 to-green-600'
    }
  ];

  const recentActivity = [
    {
      type: 'login',
      user: 'admin@admin.com',
      action: 'Login exitoso',
      time: '2 min',
      location: 'Buenos Aires',
      status: 'success'
    },
    {
      type: 'alert',
      user: 'juan@easy.com',
      action: 'Intento fallido de login',
      time: '15 min',
      location: 'IP desconocida',
      status: 'warning'
    },
    {
      type: 'access',
      user: 'maria@jumbo.com',
      action: 'Acceso a analytics',
      time: '1 hora',
      location: 'Córdoba',
      status: 'success'
    },
    {
      type: 'security',
      user: 'admin@admin.com',
      action: 'Cambio de políticas',
      time: '2 horas',
      location: 'Buenos Aires',
      status: 'info'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <Users className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      case 'access': return <Eye className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${metric.color} text-white`}>
                {metric.icon}
              </div>
              {metric.change && (
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.changeType === 'positive' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(metric.change)}
                </div>
              )}
            </div>
            
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metric.value}
              </div>
              <div className="text-sm text-gray-600">
                {metric.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad reciente */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Ver todo
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentActivity.map((activity, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.action}
                      </p>
                      <span className="text-xs text-gray-500 ml-2">
                        {activity.time}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs text-gray-600 truncate">
                        {activity.user}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {activity.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mapa de conexiones */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Conexiones Geográficas</h3>
            <p className="text-sm text-gray-600">Últimas 24 horas</p>
          </div>
          
          <div className="p-6">
            {/* Simulación de mapa con ubicaciones */}
            <div className="space-y-4">
              {[
                { location: 'Buenos Aires, AR', count: 45, percentage: 60, color: 'bg-blue-500' },
                { location: 'Córdoba, AR', count: 18, percentage: 25, color: 'bg-green-500' },
                { location: 'Rosario, AR', count: 8, percentage: 10, color: 'bg-yellow-500' },
                { location: 'Otras ubicaciones', count: 4, percentage: 5, color: 'bg-gray-400' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-900">{item.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total de conexiones:</span>
                <span className="font-medium text-gray-900">75</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Ubicaciones únicas:</span>
                <span className="font-medium text-gray-900">12</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de políticas */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Estado de Políticas de Seguridad</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-sm font-medium text-gray-900 mb-1">Políticas Activas</div>
            <div className="text-2xl font-bold text-green-600">8/10</div>
            <div className="text-xs text-gray-500">Cumplimiento: 80%</div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-gray-900 mb-1">Tiempo Promedio de Sesión</div>
            <div className="text-2xl font-bold text-blue-600">2.4h</div>
            <div className="text-xs text-gray-500">Límite: 8h</div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-sm font-medium text-gray-900 mb-1">Eventos de Seguridad</div>
            <div className="text-2xl font-bold text-purple-600">23</div>
            <div className="text-xs text-gray-500">Últimas 24h</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 