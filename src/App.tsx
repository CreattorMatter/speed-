import React, { useState } from 'react';
import { LogIn, Lock, User, AlertCircle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Builder from './components/Builder/Builder';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (email === 'admin@admin.com' && password === 'admin') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setError('');
    setShowBuilder(false);
  };

  if (isAuthenticated && showBuilder) {
    return <Builder />;
  }

  if (isAuthenticated) {
    return <Dashboard onLogout={handleLogout} onNewTemplate={() => setShowBuilder(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Rest of the login form code remains the same */}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 text-white mb-4">
            <LogIn className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Speed+</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to Speed+?</span>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="#"
                className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
              >
                Register a new account
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            By signing in, you agree to our{' '}
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;