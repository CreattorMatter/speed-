import React from 'react';
import { 
  Shield, 
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

interface SecurityMetric {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

interface SecurityDashboardProps {
  className?: string;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ className = '' }) => {
  const [activeUsers, setActiveUsers] = React.useState<number>(0);
  const [rolesCount, setRolesCount] = React.useState<number>(0);
  const [groupsCount, setGroupsCount] = React.useState<number>(0);
  const [recentUsers, setRecentUsers] = React.useState<Array<{ name: string; email: string; created_at: string }>>([]);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        // Contar usuarios activos
        const { count: usersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('status', true);

        // Contar roles
        const { count: rolesTotal } = await supabase
          .from('roles')
          .select('*', { count: 'exact', head: true });

        // Contar grupos
        const { count: groupsTotal } = await supabase
          .from('groups')
          .select('*', { count: 'exact', head: true });

        // Obtener últimos 5 usuarios creados
        const { data: latestUsers } = await supabase
          .from('users')
          .select('name, email, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        setActiveUsers(usersCount || 0);
        setRolesCount(rolesTotal || 0);
        setGroupsCount(groupsTotal || 0);
        setRecentUsers(latestUsers || []);
      } catch (error) {
        console.error('Error loading security dashboard data:', error);
      }
    };

    loadData();
  }, []);

  const metrics: SecurityMetric[] = [
    {
      label: 'Usuarios Activos',
      value: activeUsers,
      icon: <Users className="w-5 h-5" />,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Total Roles',
      value: rolesCount,
      icon: <Shield className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Total Grupos',
      value: groupsCount,
      icon: <Users className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-600'
    }
  ];



  return (
    <div className={`space-y-6 ${className}`}>
      {/* Métricas principales (datos reales) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        {/* Últimos usuarios creados (datos reales) */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Últimos Usuarios Creados</h3>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentUsers.length > 0 ? (
              recentUsers.map((user, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                      {(user.name || 'U').split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name || 'Usuario'}
                        </p>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No hay usuarios registrados aún
              </div>
            )}
          </div>
        </div>

        {/* Resumen del sistema */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Resumen del Sistema</h3>
          <p className="text-sm text-gray-600 mb-4">
            Métricas clave del sistema de seguridad basadas en datos reales.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">Usuarios Activos</div>
              <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
              <div className="text-xs text-gray-500">En total</div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">Roles Configurados</div>
              <div className="text-2xl font-bold text-blue-600">{rolesCount}</div>
              <div className="text-xs text-gray-500">Roles disponibles</div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">Grupos Creados</div>
              <div className="text-2xl font-bold text-purple-600">{groupsCount}</div>
              <div className="text-xs text-gray-500">Grupos activos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 