import React from 'react';
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ErrorPageProps {
  error?: {
    type: 'login_error' | 'fatal_error' | '404' | 'permission_denied' | 'entraid_error';
    message: string;
    details?: string;
    canRetry?: boolean;
  };
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ error }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get error from location state if not passed as prop
  const errorData = error || location.state?.error || {
    type: '404',
    message: 'Página no encontrada',
    details: 'La página que buscas no existe o ha sido movida.'
  };

  const getErrorIcon = () => {
    switch (errorData.type) {
      case 'login_error':
        return '🔐';
      case 'fatal_error':
        return '💥';
      case 'permission_denied':
        return '🚫';
      case 'entraid_error':
        return '🏢';
      default:
        return '404';
    }
  };

  const getErrorTitle = () => {
    switch (errorData.type) {
      case 'login_error':
        return 'Error de Autenticación';
      case 'fatal_error':
        return 'Error del Sistema';
      case 'permission_denied':
        return 'Acceso Denegado';
      case 'entraid_error':
        return 'Error de EntraID';
      default:
        return 'Página No Encontrada';
    }
  };

  const getErrorActions = () => {
    switch (errorData.type) {
      case 'login_error':
        return (
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al Login
            </button>
            {errorData.canRetry && (
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Reintentar
              </button>
            )}
          </div>
        );
      
      case 'fatal_error':
        return (
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Ir al Inicio
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Recargar Página
            </button>
          </div>
        );
      
      default:
        return (
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Ir al Inicio
            </button>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver Atrás
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto flex items-center justify-center h-32 w-32 rounded-full bg-red-100 text-6xl mb-8"
          >
            {errorData.type === '404' ? (
              <span className="text-red-600 font-bold">404</span>
            ) : (
              <span>{getErrorIcon()}</span>
            )}
          </motion.div>

          {/* Error Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            {getErrorTitle()}
          </motion.h1>

          {/* Error Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-600 mb-2"
          >
            {errorData.message}
          </motion.p>

          {/* Error Details */}
          {errorData.details && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-500 mb-8 bg-gray-50 p-4 rounded-lg border-l-4 border-red-400"
            >
              <strong>Detalles:</strong> {errorData.details}
            </motion.p>
          )}

          {/* Error Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {getErrorActions()}
          </motion.div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-500">
              ¿Necesitas ayuda?{' '}
              <a
                href="mailto:soporte@spidplus.com"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Contacta al soporte técnico
              </a>
            </p>
          </motion.div>

          {/* App Branding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 pt-8 border-t border-gray-200"
          >
            <div className="flex items-center justify-center text-gray-400">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">SPID Plus</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ErrorPage;