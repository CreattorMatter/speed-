import React, { useState } from 'react';
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

export interface DashboardProps {
  onLogout: () => void;
  onNewTemplate: () => void;
  onNewPoster: () => void;
  onProducts: () => void;
  onPromotions: () => void;
  onBack: () => void;
  userEmail?: string;
  onSettings: () => void;
  userRole: 'admin' | 'limited';
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validar múltiples credenciales
    const validCredentials = [
      { email: 'admin@admin.com', password: 'admin', role: 'admin' as const },
      { email: 'pilar@cenco.com', password: 'pilar', role: 'limited' as const }
    ];

    const user = validCredentials.find(
      cred => cred.email === email && cred.password === password
    );
    
    if (user) {
      setIsAuthenticated(true);
      setUserRole(user.role);
      setError('');
    } else {
      setError('Usuario o contraseña inválidos');
      setIsAuthenticated(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setError('');
    setShowBuilder(false);
    setShowProducts(false);
    setShowPromotions(false);
    setShowPosterEditor(false);
  };

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

  if (isAuthenticated) {
    return (
      <>
        <Dashboard 
          onLogout={handleLogout} 
          onNewTemplate={() => setShowBuilder(true)} 
          onNewPoster={handleNewPoster}
          onProducts={() => setShowProducts(true)} 
          onPromotions={() => setShowPromotions(true)} 
          onBack={handleBack}
          userEmail={email}
          onSettings={handleSettings}
          userRole={userRole}
        />
        <ConfigurationPortal 
          isOpen={isConfigOpen} 
          onClose={() => setIsConfigOpen(false)} 
        />
      </>
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
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Speed<span className="text-violet-400">+</span>
          </h1>
          <p className="text-white/70 text-lg">Inicia sesión en tu cuenta</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg backdrop-blur-sm border border-red-500/20">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
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