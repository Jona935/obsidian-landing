'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const LOGO_URL = 'https://tdgwgxsmprjdlaaorkpm.supabase.co/storage/v1/object/public/imgs/WhatsApp_Image_2026-01-28_at_22.37.15-removebg-preview.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError('Credenciales incorrectas');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-zinc-900/50 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-zinc-900/30 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo & Title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.img
            src={LOGO_URL}
            alt="Obsidian"
            className="h-24 w-auto mx-auto mb-4"
            animate={{
              filter: [
                'drop-shadow(0 0 20px rgba(255,255,255,0.2))',
                'drop-shadow(0 0 40px rgba(255,255,255,0.4))',
                'drop-shadow(0 0 20px rgba(255,255,255,0.2))'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-[0.2em]">OBSIDIAN</h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="w-8 h-[1px] bg-zinc-700" />
            <p className="text-zinc-500 text-xs tracking-[0.3em]">ADMIN</p>
            <span className="w-8 h-[1px] bg-zinc-700" />
          </div>
        </motion.div>

        {/* Login Form */}
        <motion.form
          onSubmit={handleLogin}
          className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/50 p-8 sm:p-10 rounded-2xl shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-lg font-medium text-white mb-8 tracking-wide">Iniciar Sesión</h2>

          {error && (
            <motion.div
              className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-zinc-500 text-xs tracking-wider mb-2 uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-4 py-4 rounded-xl focus:outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all duration-300 placeholder:text-zinc-600"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-zinc-500 text-xs tracking-wider mb-2 uppercase">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-4 py-4 rounded-xl focus:outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all duration-300 placeholder:text-zinc-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-white text-black py-4 rounded-xl font-medium tracking-wide hover:bg-zinc-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Entrando...
                </span>
              ) : 'Entrar'}
            </span>
          </motion.button>
        </motion.form>

        {/* Back to site */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <a
            href="/"
            className="text-zinc-600 text-sm hover:text-zinc-400 transition-colors inline-flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Volver al sitio
          </a>
        </motion.div>

        {/* Footer text */}
        <motion.p
          className="text-center text-zinc-800 text-xs mt-12 tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          OBSIDIAN SOCIAL CLUB © 2026
        </motion.p>
      </motion.div>
    </div>
  );
}
