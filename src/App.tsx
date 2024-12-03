import React, { useState } from 'react';
import { LogIn, Lock, User, AlertCircle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Builder from './components/Builder/Builder';
import Products from './components/Products/Products';
import Promotions from './components/Promotions/Promotions';
import { PosterEditor } from './components/Posters/PosterEditor';

interface DashboardProps {
  onLogout: () => void;
  onNewTemplate: () => void;
  onNewPoster: () => void;
  onProducts: () => void;
  onPromotions: () => void;
  onBack: () => void;
  userEmail?: string;
}

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showPromotions, setShowPromotions] = useState(false);
  const [showPosterEditor, setShowPosterEditor] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAuthenticated(true);
    setError('');
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
    return <PosterEditor onBack={() => setShowPosterEditor(false)} />;
  }

  if (isAuthenticated) {
    return (
      <Dashboard 
        onLogout={handleLogout} 
        onNewTemplate={() => setShowBuilder(true)} 
        onNewPoster={handleNewPoster}
        onProducts={() => setShowProducts(true)} 
        onPromotions={() => setShowPromotions(true)} 
        onBack={handleBack}
        userEmail={email}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-400 via-rose-400 to-lime-400 flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-lg text-white mb-4 shadow-xl border border-white/30">
            <LogIn className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Speed+</h1>
          <p className="text-white/80 text-lg">Inicia sesión en tu cuenta</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
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

export default App;