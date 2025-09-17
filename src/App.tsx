import React, { useState, useEffect, Suspense } from 'react';
import { LogIn, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import type { User } from './types/index';
import Dashboard from './features/dashboard/components/Dashboard';
import Promotions from './features/promotions/components';
import { PosterEditorV3 } from './features/posters/components/Posters/PosterEditorV3';
import { PrintView } from './features/posters/components/Posters/PrintView';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/shared/ProtectedRoute';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ConfigurationPortal } from './features/settings/components/ConfigurationPortal';
import { Administration } from './features/settings/components/Administration';
import { ErrorPage } from './pages/ErrorPage';
import { PosterPreviewPage } from './pages/PosterPreview';
import Welcome from './pages/Welcome';
import { Analytics } from './features/analytics/components/Analytics';
import { supabase } from './lib/supabaseClient';
import { signInWithPassword, signOut as authSignOut, getCurrentProfile } from './services/authService';
import { HeaderProvider } from './components/shared/HeaderProvider';
import { Toaster } from 'react-hot-toast';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { getCache, setCache, clearCache } from './lib/cache';

import { CameraCapture } from './components/shared/CameraCapture';
import { toast } from 'react-hot-toast';
import { DigitalSignageView } from './features/digital-signage/components/DigitalSignageView';
import { CarouselView } from './features/digital-carousel/components/CarouselView';
import DashboardEasyPilar from './features/dashboard/components/DashboardEasyPilar';
import { BuilderV3 } from './features/builderV3/components/BuilderV3';
import { BranchDashboard } from './features/branchView/components/BranchDashboard';
import Products from './features/products/Products';
import DigitalCarouselEditor from './features/digital-carousel/components/DigitalCarouselEditor';
import { Enviados } from './pages/Enviados';
import { Recibidos } from './pages/Recibidos';


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
  userRole: 'admin' | 'limited' | 'sucursal';
  onAnalytics: () => void;
}

// Using the User type from types/index.ts instead of local interface

function AppContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  //const [showBuilder, setShowBuilder] = useState(false);
  //const [showProducts, setShowProducts] = useState(false);
  //const [showPromotions, setShowPromotions] = useState(false);
  //const [showPosterEditor, setShowPosterEditor] = useState(false);
  //const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  //const [promotion, setPromotion] = useState<number | undefined>(undefined);
  const navigate = useNavigate();
  const location = useLocation();

  const [userRole, setUserRole] = useState<'admin' | 'limited' | 'sucursal'>('admin');
  //const [showAnalytics, setShowAnalytics] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [showCamera, setShowCamera] = useState(false);
  //const [showDigitalCarousel, setShowDigitalCarousel] = useState(false);

  // Evitar bloqueos en recarga: utilitario con timeout para promesas
  const withTimeout = async <T,>(p: Promise<T>, ms: number, label = 'app') => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const timeout = new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`timeout:${label}:${ms}`)), ms);
      });
      // @ts-ignore
      return await Promise.race([p, timeout]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  };

  const USER_CACHE_KEY = 'spid:user';
  const USER_TTL_MS = 30 * 60 * 1000; // 30 minutos

  const mapRoleToDashboardRole = (role?: string): 'admin' | 'limited' | 'sucursal' => {
    const r = String(role || '').toLowerCase();
    if (r === 'admin') return 'admin';
    if (r === 'sucursal') return 'sucursal';
    return 'limited';
  };

  useEffect(() => {
    checkUser();
  }, []);

  // Mantener el estado de autenticación sincronizado ante eventos de Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
        await checkUser();
      }
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      // 🔐 PASO 0: Intentar usuario desde localStorage PRIMERO (más rápido que getSession)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          setUserRole(mapRoleToDashboardRole((parsedUser.role as any)));
          setLoading(false);
          console.log('✅ Usuario cargado desde localStorage:', parsedUser.email);
          return;
        } catch (e) {
          console.warn('Error parsing stored user:', e);
          localStorage.removeItem('user');
        }
      }

      // 🔐 PASO 1: Verificar si hay sesión activa de Supabase (local, no red)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error obteniendo sesión:', sessionError);
        localStorage.removeItem('user');
        clearCache(USER_CACHE_KEY);
        setLoading(false);
        return;
      }

      // 🔐 PASO 2: Si hay sesión de Supabase, obtener perfil fresco (con timeout para no colgar UI)
      if (session) {
        // 2a) Intentar usuario desde cache TTL primero para NO llamar a API
        const { value: cachedUser } = getCache<User>(USER_CACHE_KEY);
        if (cachedUser) {
          localStorage.setItem('user', JSON.stringify(cachedUser)); // mantener compat
          setUser(cachedUser);
          setIsAuthenticated(true);
          setUserRole(mapRoleToDashboardRole((cachedUser.role as any)));
          console.log('✅ Usuario desde cache TTL:', cachedUser.email);
          setLoading(false);
          return;
        }

        console.log('✅ Sesión de Supabase encontrada, obteniendo perfil...');
        try {
          const freshProfile = await withTimeout(getCurrentProfile(), 5000, 'getCurrentProfile');
          if (freshProfile) {
            localStorage.setItem('user', JSON.stringify(freshProfile));
            setCache(USER_CACHE_KEY, freshProfile, USER_TTL_MS);
            setUser(freshProfile);
            setIsAuthenticated(true);
            setUserRole(mapRoleToDashboardRole((freshProfile.role as any)));
            console.log('✅ Usuario autenticado desde sesión:', freshProfile.email);
            return;
          }
          // Si no hubo perfil, preferir usuario de localStorage (si existe) y si no, usar perfil mínimo
          const stored = localStorage.getItem('user');
          if (stored) {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            setIsAuthenticated(true);
            setUserRole(mapRoleToDashboardRole((parsed.role as any)));
            setCache(USER_CACHE_KEY, parsed, USER_TTL_MS);
          } else {
            const fallbackUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email || 'Usuario',
              role: 'viewer',
              status: 'active',
              created_at: new Date().toISOString(),
            } as unknown as User;
            localStorage.setItem('user', JSON.stringify(fallbackUser));
            setCache(USER_CACHE_KEY, fallbackUser, USER_TTL_MS);
            setUser(fallbackUser);
            setIsAuthenticated(true);
            setUserRole(mapRoleToDashboardRole('viewer'));
          }
          console.warn('⚠️ Usando perfil mínimo por timeout/ausencia de perfil');
          return;
        } catch (profileError) {
          console.error('Error obteniendo perfil fresco:', profileError);
          // Preferir usuario de localStorage si existe, o caer a perfil mínimo
          const stored = localStorage.getItem('user');
          if (stored) {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            setIsAuthenticated(true);
            setUserRole(mapRoleToDashboardRole((parsed.role as any)));
            setCache(USER_CACHE_KEY, parsed, USER_TTL_MS);
          } else {
            const fallbackUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email || 'Usuario',
              role: 'viewer',
              status: 'active',
              created_at: new Date().toISOString(),
            } as unknown as User;
            localStorage.setItem('user', JSON.stringify(fallbackUser));
            setCache(USER_CACHE_KEY, fallbackUser, USER_TTL_MS);
            setUser(fallbackUser);
            setIsAuthenticated(true);
            setUserRole(mapRoleToDashboardRole('viewer'));
          }
          return;
        }
      }

      // 🔐 PASO 3: No hay sesión ni usuario guardado
      console.log('❌ No hay sesión ni usuario en localStorage');
      setLoading(false);

    } catch (error) {
      console.error('Error durante la verificación del usuario:', error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const profile = await signInWithPassword(email, password);
      setUser(profile);
      setIsAuthenticated(true);
      setUserRole((profile.role as any) || 'viewer');
      setCache(USER_CACHE_KEY, profile, USER_TTL_MS);
      // Si es primer login, redirigir a crear nueva contraseña
      if ((profile as any).first_login) {
        navigate('/welcome');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      setError('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = async () => {
    try {
      await authSignOut();
      setUser(null);
      
      // Limpiar todos los estados de la aplicación
      setIsAuthenticated(false);
      setEmail('');
      setPassword('');
      setError('');
      
      // Redirigir al login
      navigate('/');
      // Limpiar caches TTL
      clearCache(USER_CACHE_KEY);
      try { localStorage.removeItem('spid:permissions'); } catch {}
    } catch (error) {
      console.error('Error durante el logout:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  React.useEffect(() => {
    if (location.state?.showPosterEditor) {
      //setShowPosterEditor(true);
      if (location.state.selectedProducts) {
        //setSelectedProducts(location.state.selectedProducts);
      }
      if (location.state.selectedPromotion) {
        //setPromotion(location.state.selectedPromotion.id);
      }
    }
  }, [location.state]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  const handleBack = () => {
    navigate('/');
  };

  const handleNewPoster = () => {
    navigate('/poster-editor');
  };

  const handleSettings = () => {
    navigate('/administration');
  };

  const handleAnalytics = () => {
    navigate('/analytics');
  };





  const handlePhotoTaken = async (imageUrl: string) => {
    try {
      console.log('Guardando imagen:', imageUrl);
      
      const { error } = await supabase
        .from('builder')
        .insert([
          {
            image_url: imageUrl,
            created_by: user?.id,
            created_at: new Date().toISOString(),
            type: 'captured_image',
            status: 'active'
          }
        ]);

      if (error) {
        console.error('Error en supabase:', error);
        throw error;
      }
      
      toast.success('Imagen guardada correctamente');
      setShowCamera(false);
    } catch (err) {
      console.error('Error saving image:', err);
      toast.error('Error al guardar la imagen');
    }
  };

  const isEasyPilarUser = (email?: string) => {
    return email?.toLowerCase() === 'easypilar@cenco.com';
  };

  const renderDashboard = () => {
    if (isEasyPilarUser(user?.email)) {
      return (
        <DashboardEasyPilar
          onLogout={handleLogout}
          onProducts={() => navigate('/products')}
          onPromotions={() => navigate('/promotions')}
          onBack={() => {}} // 🔧 NO mostrar botón "Volver" en dashboard Easy Pilar
          userEmail={user?.email || ''}
          userName={user?.name || ''}
          onSettings={handleSettings}
          onAnalytics={handleAnalytics}
        />
      );
    }

    return (
      <Dashboard
        onLogout={handleLogout}
        onNewTemplate={() => navigate('/builder')}
        onNewPoster={handleNewPoster}
        onProducts={() => navigate('/products')}
        onPromotions={() => navigate('/promotions')}
        onBack={() => {}} // 🔧 NO mostrar botón "Volver" en dashboard principal
        userEmail={user?.email || ''}
        onSettings={handleSettings}
        userRole={userRole}
        onAnalytics={handleAnalytics}
      />
    );
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 
                    flex items-start justify-center pt-4 sm:pt-10 lg:pt-20 p-2 sm:p-4 lg:p-6">
        <div className="w-full max-w-xs xs:max-w-sm sm:max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 
                          rounded-full bg-white/10 backdrop-blur-lg">
              <LogIn className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
            </div>
            <h1 className="text-2xl xs:text-2.5xl sm:text-3xl lg:text-4xl font-bold mb-2 mt-4">
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-400 bg-clip-text text-transparent">
                SPID
              </span>
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                {' '}Plus
              </span>
            </h1>
            <p className="text-white/70 text-sm xs:text-base sm:text-lg">Inicia sesión en tu cuenta</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl p-4 xs:p-6 sm:p-8 border border-white/10">
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
                  <p className="text-red-400 text-xs xs:text-sm flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
                    <span className="break-words">{error}</span>
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs xs:text-sm font-medium text-white/90">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-4 w-4 xs:h-5 xs:w-5 text-white/40" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className="block w-full pl-8 xs:pl-10 pr-3 py-2 xs:py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-lg 
                             focus:ring-2 focus:ring-white/50 focus:border-transparent placeholder-white/30 text-white
                             text-sm xs:text-base transition-all duration-200"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-xs xs:text-sm font-medium text-white/90">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 xs:h-5 xs:w-5 text-white/40" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="block w-full pl-8 xs:pl-10 pr-3 py-2 xs:py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-lg 
                             focus:ring-2 focus:ring-white/50 focus:border-transparent placeholder-white/30 text-white
                             text-sm xs:text-base transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 xs:py-3 sm:py-3.5 px-4 bg-white/20 hover:bg-white/30 text-white rounded-lg 
                         transition-all duration-200 font-medium shadow-lg hover:shadow-xl
                         backdrop-blur-lg border border-white/20 text-sm xs:text-base
                         active:scale-95 transform"
              >
                Iniciar Sesión
              </button>


            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HeaderProvider 
      userEmail={user?.email || ''}
      userName={user?.name || ''}
    >
      <Routes>
        <Route
          path="/"
          element={renderDashboard()}
        />
        
        <Route
          path="/sucursal"
          element={<BranchDashboard />}
        />
        
        <Route
          path="/builder"
          element={
            <ProtectedRoute allowedRoles={['admin','editor']}>
              <BuilderV3 
                onBack={handleBack}
                onLogout={handleLogout}
                userEmail={user?.email || ''}
                userName={user?.name || ''}
                userRole={userRole as any}
              />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/products"
          element={
            <ProtectedRoute allowedRoles={['admin','editor','viewer','sucursal']}>
              <Products 
                onBack={handleBack} 
                onLogout={handleLogout}
                userEmail={user?.email || ''} 
                userName={user?.name || ''}
              />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/promotions"
          element={
            <Promotions onBack={handleBack} />
          }
        />
        
        <Route
          path="/poster-editor"
          element={
            <ProtectedRoute allowedRoles={['admin','editor','sucursal']}>
              <PosterEditorV3 
                onBack={handleBack} 
                onLogout={handleLogout}
                userEmail={user?.email || ''}
                userName={user?.name || ''}
              />
            </ProtectedRoute>
          }
        />
        
        <Route path="/print-view" element={<PrintView />} />
        <Route path="/poster-preview" element={<PosterPreviewPage />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/digital-signage" element={<DigitalSignageView />} />
        
        <Route
          path="/analytics"
          element={
            <Analytics 
              onBack={handleBack}
              onLogout={handleLogout}
              userEmail={user?.email || ''}
              userName={user?.name || ''}
            />
          }
        />

        <Route
          path="/administration"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Administration
                onBack={handleBack}
                onLogout={handleLogout}
                userEmail={user?.email || ''}
                userName={user?.name || ''}
                currentUser={user || { id: '0', email: '', name: '', role: '', status: 'active', lastLogin: '', created_at: '' }}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/digital-carousel"
          element={
            <DigitalCarouselEditor
              onBack={handleBack}
              onLogout={handleLogout}
              userEmail={user?.email || ''}
              userName={user?.name || ''}
            />
          }
        />

        <Route
          path="/carousel/:id"
          element={
            <Suspense fallback={
              <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              <CarouselView />
            </Suspense>
          }
        />

        <Route path="/playlist/:id" element={<CarouselView />} />

        <Route path="/enhanced-builder" element={<div>Enhanced Builder (ruta por definir)</div>} />

        <Route
          path="/enviados"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Enviados
                onBack={handleBack}
                onLogout={handleLogout}
                userEmail={user?.email || ''}
                userName={user?.name || ''}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recibidos"
          element={
            <ProtectedRoute allowedRoles={['admin', 'sucursal']}>
              <Recibidos
                onBack={handleBack}
                onLogout={handleLogout}
                userEmail={user?.email || ''}
                userName={user?.name || ''}
              />
            </ProtectedRoute>
          }
        />

        {/* 🆕 Error Pages */}
        <Route 
          path="/error" 
          element={<ErrorPage />} 
        />
        
        {/* 🆕 404 Catch-all Route */}
        <Route 
          path="*" 
          element={
            <ErrorPage 
              error={{
                type: '404',
                message: 'Página no encontrada',
                details: 'La página que buscas no existe o ha sido movida.'
              }}
            />
          } 
        />

      </Routes>

      {/* ConfigurationPortal removed - now using /administration route */}



      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onPhotoTaken={handlePhotoTaken}
      />


    </HeaderProvider>
  );
}

function App() {
  return (
    <PermissionsProvider>
      <Router>
        <Suspense fallback={null}>
          <AppContent />
          <Toaster 
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4CAF50',
                  secondary: '#FFF',
                },
              },
              error: {
                duration: 3000,
                iconTheme: {
                  primary: '#F44336',
                  secondary: '#FFF',
                },
              },
            }}
          />
        </Suspense>
      </Router>
    </PermissionsProvider>
  );
}

export default App;