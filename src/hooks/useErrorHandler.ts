import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import type { LoginAttempt } from '@/types';

interface ErrorHandlerOptions {
  showToast?: boolean;
  redirectToError?: boolean;
  logToConsole?: boolean;
}

export const useErrorHandler = () => {
  const navigate = useNavigate();

  const handleError = (
    error: {
      type: 'login_error' | 'fatal_error' | '404' | 'permission_denied' | 'entraid_error';
      message: string;
      details?: string;
      canRetry?: boolean;
    },
    options: ErrorHandlerOptions = {}
  ) => {
    const { 
      showToast = true, 
      redirectToError = true, 
      logToConsole = true 
    } = options;

    // Log to console for debugging
    if (logToConsole) {
      console.error('🚨 [ERROR HANDLER]', {
        type: error.type,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString()
      });
    }

    // Show toast notification
    if (showToast) {
      const toastMessage = error.details 
        ? `${error.message}: ${error.details}`
        : error.message;
      
      switch (error.type) {
        case 'login_error':
          toast.error(`🔐 ${toastMessage}`, { duration: 5000 });
          break;
        case 'fatal_error':
          toast.error(`💥 ${toastMessage}`, { duration: 8000 });
          break;
        case 'permission_denied':
          toast.error(`🚫 ${toastMessage}`, { duration: 5000 });
          break;
        case 'entraid_error':
          toast.error(`🏢 ${toastMessage}`, { duration: 5000 });
          break;
        default:
          toast.error(toastMessage, { duration: 4000 });
      }
    }

    // Redirect to error page
    if (redirectToError) {
      navigate('/error', { state: { error } });
    }
  };

  // Specific handlers for common error types
  const handleLoginError = (
    message: string, 
    details?: string, 
    canRetry: boolean = true
  ) => {
    handleError({
      type: 'login_error',
      message,
      details,
      canRetry
    });
  };

  const handleFatalError = (
    message: string, 
    details?: string
  ) => {
    handleError({
      type: 'fatal_error',
      message,
      details,
      canRetry: false
    });
  };

  const handlePermissionDenied = (
    message: string = 'No tienes permisos para realizar esta acción',
    details?: string
  ) => {
    handleError({
      type: 'permission_denied',
      message,
      details,
      canRetry: false
    });
  };

  const handleEntraIdError = (
    message: string = 'Error de autenticación con EntraID',
    details?: string
  ) => {
    handleError({
      type: 'entraid_error',
      message,
      details,
      canRetry: true
    });
  };

  const handle404 = (
    message: string = 'Página no encontrada',
    details?: string
  ) => {
    handleError({
      type: '404',
      message,
      details,
      canRetry: false
    });
  };

  // Log failed login attempts
  const logFailedLogin = (
    email: string,
    errorType: LoginAttempt['error_type'],
    errorMessage: string
  ): LoginAttempt => {
    const attempt: LoginAttempt = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      success: false,
      error_type: errorType,
      error_message: errorMessage,
      timestamp: new Date().toISOString(),
      ip_address: 'unknown' // In production, get from request
    };

    // In production, this would be sent to your analytics/monitoring service
    console.warn('🔒 [LOGIN ATTEMPT FAILED]', attempt);
    
    return attempt;
  };

  return {
    handleError,
    handleLoginError,
    handleFatalError,
    handlePermissionDenied,
    handleEntraIdError,
    handle404,
    logFailedLogin
  };
};

export default useErrorHandler;