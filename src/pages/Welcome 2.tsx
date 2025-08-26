import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword, getCurrentProfile, markFirstLoginCompleted } from '@/services/authService';

export default function Welcome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const profile = await getCurrentProfile();
        if (!profile) {
          navigate('/');
          return;
        }
        localStorage.setItem('user', JSON.stringify(profile));
        setIsFirstLogin(!!profile.first_login);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      await updatePassword(password);
      // marcar first_login=false en BD y en localStorage
      await markFirstLoginCompleted();
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        u.first_login = false;
        localStorage.setItem('user', JSON.stringify(u));
      }
      navigate('/');
    } catch (err) {
      setError('No se pudo actualizar la contraseña');
    }
  };

  if (loading) return null;

  if (!isFirstLogin) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow w-full max-w-md space-y-4">
        <h1 className="text-lg font-semibold">Bienvenido, crea tu nueva contraseña</h1>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <label className="block text-sm mb-1">Nueva contraseña</label>
          <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Confirmar contraseña</label>
          <input type="password" className="w-full border rounded px-3 py-2" value={confirm} onChange={e=>setConfirm(e.target.value)} />
        </div>
        <button className="w-full bg-indigo-600 text-white rounded px-3 py-2">Guardar</button>
      </form>
    </div>
  );
}


