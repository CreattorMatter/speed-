import React, { useState, useEffect, Suspense } from 'react';
import { LogIn, Lock, User, AlertCircle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Builder from './components/Builder/Builder';
import Products from './components/Products/Products';
import Promotions from './components/Promotions';
import { PosterEditor } from './components/Posters/PosterEditor';
import { PrintView } from './components/Posters/PrintView';
import { DigitalCarouselEditor } from './components/DigitalCarousel/DigitalCarouselEditor';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ConfigurationPortal } from './components/Settings/ConfigurationPortal';
import { PosterPreviewPage } from './pages/PosterPreview';
import { Analytics } from './components/Analytics/Analytics';
import { supabase } from './lib/supabaseClient';
import { HeaderProvider } from './components/shared/HeaderProvider';
import { Toaster } from 'react-hot-toast';
import { MobileDetectionModal } from './components/shared/MobileDetectionModal';
import { CameraCapture } from './components/shared/CameraCapture';
import { toast } from 'react-hot-toast';
import { DigitalSignageView } from './components/DigitalSignage/DigitalSignageView';
import { CarouselView } from './components/DigitalCarousel/CarouselView';
import DashboardEasyPilar from './components/DashboardEasyPilar';

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
  onDigitalPoster: () => void;
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showDigitalCarousel, setShowDigitalCarousel] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        
        // Verificar que el usuario sigue activo en la base de datos
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', parsedUser.email)
          .eq('status', 'active')
          .single();

        if (userError || !userData) {
          console.error('Usuario no encontrado o inactivo');
          localStorage.removeItem('user');
          return;
        }

        setUser(parsedUser);
        setIsAuthenticated(true);
        setUserRole(parsedUser.role === 'admin' ? 'admin' : 'limited');

        if (isMobile()) {
          setShowMobileModal(true);
        }
      }
    } catch (error) {
      console.error('Error durante la verificación del usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      console.log('Intentando login con:', email);
      
      // Verificar credenciales directamente en la tabla users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (userError) {
        console.error('Error al verificar usuario:', userError);
        setError('Error al verificar credenciales');
        return;
      }

      if (!userData) {
        console.error('Usuario no encontrado');
        setError('Usuario o contraseña incorrectos');
        return;
      }

      if (userData.status !== 'active') {
        console.error('Usuario inactivo');
        setError('Usuario inactivo');
        return;
      }

      // Guardar datos del usuario
      const user = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        status: userData.status
      };

      // Guardar en localStorage y estado
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      setUserRole(userData.role === 'admin' ? 'admin' : 'limited');

      // Verificar si es dispositivo móvil
      if (isMobile()) {
        setShowMobileModal(true);
      }

      console.log('Login exitoso:', user);
    } catch (error) {
      console.error('Error durante el login:', error);
      setError('Error al iniciar sesión');
    }
  };

  const handleLogout = () => {
    try {
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
    } catch (error) {
      console.error('Error durante el logout:', error);
      toast.error('Error al cerrar sesión');
    }
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
    navigate('/');
  };

  const handleNewPoster = () => {
    navigate('/poster-editor');
  };

  const handleSettings = () => {
    setIsConfigOpen(true);
  };

  const handleAnalytics = () => {
    navigate('/analytics');
  };

  const handleDigitalPoster = () => {
    navigate('/digital-carousel');
  };

  const isMobile = () => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    // Patrón más detallado para detectar dispositivos móviles
    const mobilePattern = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet|ipad/i;
    
    // Verificar también el tipo de dispositivo si está disponible
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    console.log('User Agent:', userAgent);
    console.log('Es dispositivo táctil:', isTouchDevice);
    console.log('Coincide con patrón móvil:', mobilePattern.test(userAgent.toLowerCase()));
    
    return mobilePattern.test(userAgent.toLowerCase()) || isTouchDevice;
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
          onBack={handleBack}
          userEmail={user?.email || ''}
          onSettings={handleSettings}
          onAnalytics={handleAnalytics}
          onDigitalPoster={handleDigitalPoster}
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
        onBack={handleBack}
        userEmail={user?.email || ''}
        onSettings={handleSettings}
        userRole={userRole}
        onAnalytics={handleAnalytics}
        onDigitalPoster={handleDigitalPoster}
      />
    );
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
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
            <form onSubmit={handleLogin} className="space-y-6">
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
          path="/builder"
          element={
            <Builder 
              onBack={handleBack}
              userEmail={user?.email || ''}
              userName={user?.name || ''}
              userRole={userRole}
            />
          }
        />
        
        <Route
          path="/products"
          element={
            <Products 
              onBack={handleBack} 
              onLogout={handleLogout}
              userEmail={user?.email || ''} 
              userName={user?.name || ''}
            />
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
            <PosterEditor 
              onBack={handleBack}
              onLogout={handleLogout}
              initialProducts={location.state?.selectedProducts}
              initialPromotion={location.state?.selectedPromotion}
              userEmail={user?.email || ''}
              userName={user?.name || ''}
            />
          }
        />
        
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
      </Routes>

      <ConfigurationPortal 
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        currentUser={user || { id: 0, email: '', name: '', role: '' }}
      />

      <MobileDetectionModal
        isOpen={showMobileModal}
        onClose={() => setShowMobileModal(false)}
        onCapture={() => {
          setShowMobileModal(false);
          setShowCamera(true);
        }}
        onContinue={() => setShowMobileModal(false)}
      />

      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onPhotoTaken={handlePhotoTaken}
      />

      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setShowMobileModal(true)}
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded"
        >
          Test Mobile Modal
        </button>
      )}
    </HeaderProvider>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/print-view" element={<PrintView />} />
        <Route path="/poster-preview" element={<PosterPreviewPage />} />
        <Route path="/digital-signage" element={<DigitalSignageView />} />
        <Route path="*" element={<AppContent />} />
      </Routes>
      <Suspense fallback={null}>
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
  );
}

export default App;