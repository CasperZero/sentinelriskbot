import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMode, 
    setAuthModalMode, 
    login, 
    register 
  } = useAuth();

  const { language } = useLanguage();
  const isEs = language === 'es';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (authModalMode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, displayName);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError(isEs ? 'Credenciales incorrectas. Verifique su correo y contraseña.' : 'Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError(isEs ? 'Este correo ya está registrado.' : 'Email is already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError(isEs ? 'La contraseña debe tener al menos 6 caracteres.' : 'Password should be at least 6 characters.');
      } else if (err.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed')) {
        setError(
          isEs
            ? 'El inicio de sesión con Correo/Contraseña está desactivado en Firebase Console. Active "Email/Password" en Firebase Console -> Authentication -> Sign-in method.'
            : 'Email/Password authentication is disabled in your Firebase Console. Please enable "Email/Password" under Firebase Console -> Authentication -> Sign-in method.'
        );
      } else {
        setError(err.message || (isEs ? 'Error al autenticar' : 'Authentication error'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-mono">
      <div className="relative w-full max-w-md bg-[#121418] border border-[#2B2F36] rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2B2F36] bg-[#181A20]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[#F0B90B]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#EAECEF] uppercase tracking-wide">
                {authModalMode === 'login' 
                  ? (isEs ? 'Iniciar Sesión' : 'Account Login') 
                  : (isEs ? 'Crear Cuenta' : 'Register Account')}
              </h2>
              <p className="text-[11px] text-[#848E9C]">SENTINEL_NODE AUTH</p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 text-[#848E9C] hover:text-[#EAECEF] rounded-lg hover:bg-[#2B2F36] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-[#0B0E11] border-b border-[#2B2F36] text-xs">
          <button
            onClick={() => { setAuthModalMode('login'); setError(null); }}
            className={`py-2 rounded-lg font-bold transition ${
              authModalMode === 'login'
                ? 'bg-[#F0B90B] text-slate-950 shadow-sm'
                : 'text-[#848E9C] hover:text-[#EAECEF]'
            }`}
          >
            {isEs ? 'Ingresar' : 'Login'}
          </button>
          <button
            onClick={() => { setAuthModalMode('register'); setError(null); }}
            className={`py-2 rounded-lg font-bold transition ${
              authModalMode === 'register'
                ? 'bg-[#F0B90B] text-slate-950 shadow-sm'
                : 'text-[#848E9C] hover:text-[#EAECEF]'
            }`}
          >
            {isEs ? 'Registrarse' : 'Register'}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#848E9C] mb-1.5">
                {isEs ? 'Nombre de Usuario / Apodo' : 'Trader Alias / Display Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#848E9C] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Satoshi_Quant"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#181A20] border border-[#2B2F36] rounded-xl pl-9 pr-3 py-2 text-xs text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#848E9C] mb-1.5">
              {isEs ? 'Correo Electrónico' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#848E9C] absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="trader@quant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#181A20] border border-[#2B2F36] rounded-xl pl-9 pr-3 py-2 text-xs text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#848E9C] mb-1.5">
              {isEs ? 'Contraseña' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#848E9C] absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#181A20] border border-[#2B2F36] rounded-xl pl-9 pr-3 py-2 text-xs text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 bg-[#F0B90B] hover:bg-[#fcd535] active:bg-[#e0ac07] text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-[#F0B90B]/10 disabled:opacity-50"
          >
            {submitting ? (
              <span>{isEs ? 'Procesando...' : 'Authenticating...'}</span>
            ) : (
              <>
                <span>{authModalMode === 'login' ? (isEs ? 'ACCEDER AL ALGORITMO' : 'SIGN IN TO NODE') : (isEs ? 'CREAR CUENTA GRATUITA' : 'CREATE FREE ACCOUNT')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[11px] text-[#848E9C] text-center pt-2">
            {authModalMode === 'login' ? (
              <>
                {isEs ? '¿No tiene cuenta aún?' : "Don't have an account yet?"}{' '}
                <button
                  type="button"
                  onClick={() => setAuthModalMode('register')}
                  className="text-[#F0B90B] underline hover:text-[#fcd535]"
                >
                  {isEs ? 'Regístrese gratis' : 'Register free'}
                </button>
              </>
            ) : (
              <>
                {isEs ? '¿Ya tiene cuenta?' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => setAuthModalMode('login')}
                  className="text-[#F0B90B] underline hover:text-[#fcd535]"
                >
                  {isEs ? 'Inicie sesión' : 'Log in here'}
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
};
