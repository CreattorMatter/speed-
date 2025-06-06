import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store, useAppDispatch, useAppSelector } from './redux/store';
import BuilderMain from './BuilderMain';

// Actions
import { fetchOrganization, setCurrentUser } from './redux/organizationSlice';
import { fetchTemplates } from './redux/templatesSlice';
import { fetchAssets } from './redux/assetsSlice';
import { updateSettings as updateAISettings } from './redux/aiSlice';

// ====================================
// COMPONENTES PLACEHOLDER TEMPORALES
// ====================================

const TemplateLibrary: React.FC = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Biblioteca de Templates</h2>
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <div className="text-6xl mb-4">📋</div>
      <h3 className="text-xl font-semibold mb-2">Sistema de Templates Avanzado</h3>
      <p className="text-gray-600 mb-4">
        Gestión completa de plantillas con categorización, favoritos, búsqueda avanzada y colaboración.
      </p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded">✓ Categorías inteligentes</div>
        <div className="bg-green-50 p-3 rounded">✓ Sistema de ratings</div>
        <div className="bg-purple-50 p-3 rounded">✓ Comentarios y colaboración</div>
        <div className="bg-yellow-50 p-3 rounded">✓ Analytics de uso</div>
      </div>
    </div>
  </div>
);

const AssetManager: React.FC = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Gestión de Assets</h2>
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <div className="text-6xl mb-4">🖼️</div>
      <h3 className="text-xl font-semibold mb-2">Biblioteca de Recursos Multimedia</h3>
      <p className="text-gray-600 mb-4">
        Upload, organización y gestión inteligente de imágenes, logos, iconos y fuentes.
      </p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded">✓ Upload con drag & drop</div>
        <div className="bg-green-50 p-3 rounded">✓ Colecciones organizadas</div>
        <div className="bg-purple-50 p-3 rounded">✓ Optimización automática</div>
        <div className="bg-yellow-50 p-3 rounded">✓ Metadatos inteligentes</div>
      </div>
    </div>
  </div>
);

const OrganizationDashboard: React.FC = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Dashboard de Organización</h2>
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <div className="text-6xl mb-4">🏢</div>
      <h3 className="text-xl font-semibold mb-2">Gestión Enterprise Multi-Tenant</h3>
      <p className="text-gray-600 mb-4">
        Administración completa de usuarios, equipos, roles y permisos granulares.
      </p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded">✓ Roles y permisos</div>
        <div className="bg-green-50 p-3 rounded">✓ Gestión de equipos</div>
        <div className="bg-purple-50 p-3 rounded">✓ Auditoría completa</div>
        <div className="bg-yellow-50 p-3 rounded">✓ SSO y seguridad</div>
      </div>
    </div>
  </div>
);

const AIAssistant: React.FC = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Asistente de IA</h2>
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <div className="text-6xl mb-4">🤖</div>
      <h3 className="text-xl font-semibold mb-2">Inteligencia Artificial Generativa</h3>
      <p className="text-gray-600 mb-4">
        Generación automática de contenido, optimización de diseño y sugerencias inteligentes.
      </p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded">✓ Generación de contenido</div>
        <div className="bg-green-50 p-3 rounded">✓ Optimización de layouts</div>
        <div className="bg-purple-50 p-3 rounded">✓ Smart templates</div>
        <div className="bg-yellow-50 p-3 rounded">✓ Análisis automático</div>
      </div>
    </div>
  </div>
);

const WorkflowManager: React.FC = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Gestión de Workflows</h2>
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <div className="text-6xl mb-4">⚡</div>
      <h3 className="text-xl font-semibold mb-2">Automatización Avanzada</h3>
      <p className="text-gray-600 mb-4">
        Workflows automáticos para generación, optimización y distribución de contenido.
      </p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded">✓ Triggers automáticos</div>
        <div className="bg-green-50 p-3 rounded">✓ Pipelines de IA</div>
        <div className="bg-purple-50 p-3 rounded">✓ Integrations API</div>
        <div className="bg-yellow-50 p-3 rounded">✓ Scheduled jobs</div>
      </div>
    </div>
  </div>
);

const AnalyticsDashboard: React.FC = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Analytics y Reportes</h2>
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <div className="text-6xl mb-4">📊</div>
      <h3 className="text-xl font-semibold mb-2">Business Intelligence</h3>
      <p className="text-gray-600 mb-4">
        Métricas avanzadas, reportes personalizados y insights de performance.
      </p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded">✓ Métricas en tiempo real</div>
        <div className="bg-green-50 p-3 rounded">✓ Reportes personalizados</div>
        <div className="bg-purple-50 p-3 rounded">✓ A/B testing</div>
        <div className="bg-yellow-50 p-3 rounded">✓ Predictive analytics</div>
      </div>
    </div>
  </div>
);

// ====================================
// TIPOS
// ====================================

interface EnterpriseBuilderProps {
  mode?: 'basic' | 'advanced' | 'enterprise' | 'ai-powered';
  organizationId?: string;
  userId?: string;
  features?: {
    templates: boolean;
    assets: boolean;
    collaboration: boolean;
    analytics: boolean;
    ai: boolean;
    workflows: boolean;
    multiTenant: boolean;
  };
}

type ViewMode = 
  | 'builder' 
  | 'templates' 
  | 'assets' 
  | 'organization' 
  | 'analytics' 
  | 'workflows' 
  | 'ai-assistant';

// ====================================
// COMPONENTE PRINCIPAL
// ====================================

const EnterpriseBuilderInternal: React.FC<EnterpriseBuilderProps> = ({
  mode = 'enterprise',
  organizationId = 'org-demo',
  userId = 'user-1',
  features = {
    templates: true,
    assets: true,
    collaboration: true,
    analytics: true,
    ai: true,
    workflows: true,
    multiTenant: true
  }
}) => {
  const dispatch = useAppDispatch();
  
  // Estado global
  const currentUser = useAppSelector(state => state.organization.currentUser);
  const currentOrganization = useAppSelector(state => state.organization.currentOrganization);
  const aiSettings = useAppSelector(state => state.ai.settings);
  
  // Estado local
  const [currentView, setCurrentView] = useState<ViewMode>('builder');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // ====================================
  // INICIALIZACIÓN
  // ====================================

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Cargar organización
        if (features.multiTenant) {
          await dispatch(fetchOrganization(organizationId)).unwrap();
        }

        // 2. Establecer usuario actual (mock)
        const mockUser = {
          id: userId,
          email: 'admin@supermercado.com',
          firstName: 'Admin',
          lastName: 'Demo',
          avatar: '/avatars/admin.jpg',
          status: 'active' as const,
          roles: ['admin', 'editor'],
          teams: ['team-marketing', 'team-design'],
          organizationId,
          preferences: {
            language: 'es',
            timezone: 'America/Argentina/Buenos_Aires',
            theme: 'light' as const,
            notifications: {
              email: true,
              push: true,
              inApp: true
            }
          },
          lastLoginAt: Date.now() - 3600000,
          createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
          updatedAt: Date.now() - 24 * 60 * 60 * 1000
        };
        
        dispatch(setCurrentUser(mockUser));

        // 3. Cargar templates si está habilitado
        if (features.templates) {
          await dispatch(fetchTemplates()).unwrap();
        }

        // 4. Cargar assets si está habilitado
        if (features.assets) {
          await dispatch(fetchAssets()).unwrap();
        }

        // 5. Configurar IA si está habilitada
        if (features.ai) {
          dispatch(updateAISettings({
            enableAI: true,
            autoSuggestImprovements: true,
            industry: 'retail',
            language: 'es',
            brandVoice: 'friendly'
          }));
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error inicializando aplicación:', error);
      }
    };

    initializeApp();
  }, [dispatch, organizationId, userId, features]);

  // ====================================
  // NAVEGACIÓN PRINCIPAL
  // ====================================

  const navigationItems = [
    {
      id: 'builder',
      label: 'Editor',
      icon: '🎨',
      view: 'builder' as ViewMode,
      enabled: true,
      description: 'Editor principal de carteles'
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: '📋',
      view: 'templates' as ViewMode,
      enabled: features.templates,
      description: 'Biblioteca de plantillas'
    },
    {
      id: 'assets',
      label: 'Assets',
      icon: '🖼️',
      view: 'assets' as ViewMode,
      enabled: features.assets,
      description: 'Gestión de recursos'
    },
    {
      id: 'ai-assistant',
      label: 'IA Assistant',
      icon: '🤖',
      view: 'ai-assistant' as ViewMode,
      enabled: features.ai,
      description: 'Asistente de inteligencia artificial'
    },
    {
      id: 'workflows',
      label: 'Workflows',
      icon: '⚡',
      view: 'workflows' as ViewMode,
      enabled: features.workflows,
      description: 'Automatización de procesos'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📊',
      view: 'analytics' as ViewMode,
      enabled: features.analytics,
      description: 'Analíticas y reportes'
    },
    {
      id: 'organization',
      label: 'Organización',
      icon: '🏢',
      view: 'organization' as ViewMode,
      enabled: features.multiTenant && features.collaboration,
      description: 'Gestión de organización'
    }
  ];

  // ====================================
  // RENDERIZADO
  // ====================================

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando Enterprise Builder...</p>
          <p className="text-sm text-gray-400 mt-2">
            Cargando {mode} mode con {Object.values(features).filter(Boolean).length} características
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar de navegación */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Enterprise Builder
                </h1>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {mode} mode
                </p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>
        </div>

        {/* Información del usuario */}
        {!sidebarCollapsed && currentUser && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {currentUser.firstName[0]}{currentUser.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentOrganization?.displayName}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navegación */}
        <nav className="p-2">
          {navigationItems.filter(item => item.enabled).map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.view)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentView === item.view
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={sidebarCollapsed ? item.description : undefined}
            >
              <span className="text-lg">{item.icon}</span>
              {!sidebarCollapsed && (
                <div>
                  <span className="font-medium">{item.label}</span>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Información de características */}
        {!sidebarCollapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-medium text-gray-900 mb-2">
                Características Activas
              </h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {Object.entries(features).map(([key, enabled]) => (
                  <div
                    key={key}
                    className={`flex items-center space-x-1 ${
                      enabled ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <span>{enabled ? '✓' : '✗'}</span>
                    <span className="capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barra de estado superior */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {navigationItems.find(item => item.view === currentView)?.label}
              </h2>
              {currentView === 'builder' && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Fase 1-4 Completas</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Todas las funcionalidades activas
                  </span>
                </div>
              )}
            </div>

            {/* Indicadores de estado */}
            <div className="flex items-center space-x-3">
              {features.ai && aiSettings.enableAI && (
                <div className="flex items-center space-x-2 text-sm text-purple-600">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                  <span>IA Activa</span>
                </div>
              )}
              
              {features.collaboration && currentOrganization && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Colaboración</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Sistema Operativo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vista principal */}
        <div className="flex-1 overflow-hidden">
          {currentView === 'builder' && <BuilderMain />}
          {currentView === 'templates' && features.templates && <TemplateLibrary />}
          {currentView === 'assets' && features.assets && <AssetManager />}
          {currentView === 'organization' && features.multiTenant && <OrganizationDashboard />}
          {currentView === 'analytics' && features.analytics && <AnalyticsDashboard />}
          {currentView === 'workflows' && features.workflows && <WorkflowManager />}
          {currentView === 'ai-assistant' && features.ai && <AIAssistant />}
        </div>
      </div>
    </div>
  );
};

// ====================================
// COMPONENTE CON PROVIDER
// ====================================

const EnterpriseBuilder: React.FC<EnterpriseBuilderProps> = (props) => {
  return (
    <Provider store={store}>
      <EnterpriseBuilderInternal {...props} />
    </Provider>
  );
};

export default EnterpriseBuilder;

// ====================================
// EXPORTAR TIPOS Y UTILIDADES
// ====================================

export type { EnterpriseBuilderProps, ViewMode };

// Presets de configuración para diferentes casos de uso
export const BUILDER_PRESETS = {
  basic: {
    mode: 'basic' as const,
    features: {
      templates: false,
      assets: false,
      collaboration: false,
      analytics: false,
      ai: false,
      workflows: false,
      multiTenant: false
    }
  },
  
  advanced: {
    mode: 'advanced' as const,
    features: {
      templates: true,
      assets: true,
      collaboration: false,
      analytics: true,
      ai: false,
      workflows: false,
      multiTenant: false
    }
  },
  
  enterprise: {
    mode: 'enterprise' as const,
    features: {
      templates: true,
      assets: true,
      collaboration: true,
      analytics: true,
      ai: false,
      workflows: true,
      multiTenant: true
    }
  },
  
  aiPowered: {
    mode: 'ai-powered' as const,
    features: {
      templates: true,
      assets: true,
      collaboration: true,
      analytics: true,
      ai: true,
      workflows: true,
      multiTenant: true
    }
  }
};

// Función de utilidad para crear instancias configuradas
export const createEnterpriseBuilder = (preset: keyof typeof BUILDER_PRESETS) => {
  return (props: Partial<EnterpriseBuilderProps>) => (
    <EnterpriseBuilder {...BUILDER_PRESETS[preset]} {...props} />
  );
}; 