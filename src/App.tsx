import React, { useState, useEffect } from 'react';
import { LogIn, Lock, User, AlertCircle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Builder from './components/Builder/Builder';
import Products from './components/Products/Products';
import Promotions from './components/Promotions';
import { PosterEditor } from './components/Posters/PosterEditor';
import { PrintView } from './components/Posters/PrintView';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ConfigurationPortal } from './components/Settings/ConfigurationPortal';
import { PosterPreviewPage } from './pages/PosterPreview';
import { Analytics } from './components/Analytics/Analytics';
import { supabase } from './lib/supabaseClient';
import { HeaderProvider } from './components/shared/HeaderProvider';

export interface DashboardProps {
  onLogout: () => void;
  onNewTemplate: () => void;
  onNewPoster: () => void;
  onProducts: () => void;
  onPromotions: () => void;
  onBack: () => void;
  userEmail: string;
  userName: string;
  onSettings: () => void;
  userRole: 'admin' | 'limited';
  onAnalytics: () => void;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  password?: string;
}

function AppContent() {
  const [email, setEmail] = useState('admin@admin.com');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showPromotions, setShowPromotions] = useState(false);
  const [showPosterEditor, setShowPosterEditor] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [promotion, setPromotion] = useState<number | undefined>(undefined);
  const navigate = useNavigate();
  const location = useLocation();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'limited'>('admin');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('Usuario recuperado del localStorage:', parsedUser);
        
        if (parsedUser && parsedUser.email && parsedUser.name) {
          setUser(parsedUser);
          setIsAuthenticated(true);
          setUserRole(parsedUser.role === 'admin' ? 'admin' : 'limited');
        } else {
          console.warn('Usuario en localStorage no tiene todos los campos necesarios');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .eq('status', 'active')
        .single();

      console.log('Login - Usuario recuperado de Supabase:', userData);

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error('Error al verificar credenciales');
      }

      if (!userData) {
        throw new Error('Usuario o contraseña inválidos');
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        status: userData.status as 'active' | 'inactive'
      };

      console.log('Usuario formateado antes de guardar:', user);

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setIsAuthenticated(true);
      setUserRole(user.role === 'admin' ? 'admin' : 'limited');
      
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      setIsAuthenticated(false);
    }
  };

  const handleLogout = () => {
    // Limpiar el usuario y localStorage
    setUser(null);
    localStorage.removeItem('user');
    
    // Limpiar todos los estados de la aplicación
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setError('');
    setShowBuilder(false);
    setShowProducts(false);
    setShowPromotions(false);
    setShowPosterEditor(false);
    setShowAnalytics(false);
    setIsConfigOpen(false);
    
    // Redirigir al login
    navigate('/');
  };

  React.useEffect(() => {
    if (location.state?.showPosterEditor) {
      setShowPosterEditor(true);
      if (location.state.selectedProducts) {
        setSelectedProducts(location.state.selectedProducts);
      }
      if (location.state.selectedPromotion) {
        setPromotion(location.state.selectedPromotion.id);
      }
    }
  }, [location.state]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  const handleBack = () => {
    if (showBuilder) {
      setShowBuilder(false);
    } else if (showProducts) {
      setShowProducts(false);
    } else if (showPromotions) {
      setShowPromotions(false);
    } else if (showPosterEditor) {
      setShowPosterEditor(false);
    } else if (isAuthenticated) {
      if (window.confirm('¿Deseas cerrar sesión?')) {
        handleLogout();
      }
    }
  };

  const handleNewPoster = () => {
    setShowPosterEditor(true);
  };

  const handleSettings = () => {
    console.log('Opening settings...');
    setIsConfigOpen(true);
  };

  const handleAnalytics = () => {
    setShowAnalytics(true);
  };

  if (isAuthenticated && showBuilder) {
    return <Builder onBack={handleBack} />;
  }

  if (isAuthenticated && showProducts) {
    return <Products onBack={handleBack} />;
  }

  if (isAuthenticated && showPromotions) {
    return <Promotions onBack={handleBack} />;
  }

  if (isAuthenticated && showPosterEditor) {
    return (
      <PosterEditor 
        onBack={() => setShowPosterEditor(false)}
        onLogout={handleLogout}
        initialProducts={location.state?.selectedProducts}
        initialPromotion={location.state?.selectedPromotion}
      />
    );
  }

  if (isAuthenticated && showAnalytics) {
    return <Analytics onBack={() => setShowAnalytics(false)} onLogout={handleLogout} />;
  }

  if (isAuthenticated && user?.email && user?.name) {
    return (
      <HeaderProvider 
        userEmail={user.email}
        userName={user.name}
      >
        <Dashboard 
          onLogout={handleLogout}
          onNewTemplate={() => setShowBuilder(true)}
          onNewPoster={handleNewPoster}
          onProducts={() => setShowProducts(true)}
          onPromotions={() => setShowPromotions(true)}
          onBack={handleBack}
          onSettings={handleSettings}
          userRole={userRole}
          onAnalytics={handleAnalytics}
        />
        <ConfigurationPortal 
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          currentUser={user}
        />
      </HeaderProvider>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 
                    flex items-start justify-center pt-10 sm:pt-20 p-2 sm:p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 
                        rounded-full bg-white/10 backdrop-blur-lg">
            <LogIn className="w-8 sm:w-10 h-8 sm:h-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-400 bg-clip-text text-transparent">
              SPID
            </span>
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
              {' '}Plus
            </span>
          </h1>
          <p className="text-white/70 text-lg">Inicia sesión en tu cuenta</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-white/90">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-white/40" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="block w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg 
                           focus:ring-2 focus:ring-white/50 focus:border-transparent placeholder-white/30 text-white"
                  placeholder="tu@email.com"
                  defaultValue="admin@admin.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-white/90">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/40" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="block w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg 
                           focus:ring-2 focus:ring-white/50 focus:border-transparent placeholder-white/30 text-white"
                  placeholder="••••••••"
                  defaultValue="admin"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-white/20 hover:bg-white/30 text-white rounded-lg 
                       transition-all duration-200 font-medium shadow-lg hover:shadow-xl
                       backdrop-blur-lg border border-white/20"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/print-view" element={<PrintView />} />
        <Route path="/poster-preview" element={<PosterPreviewPage />} />
        <Route path="*" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

export default App;