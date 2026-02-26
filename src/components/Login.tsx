import { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, Lock, User, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: any) => void;
  onSwitchToRegister: () => void;
}

export default function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        onLogin(data.user);
      } else {
        setError(data.error || "Kirishda xatolik yuz berdi");
      }
    } catch (err) {
      setError("Server bilan aloqa uzildi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="login" className="py-20 bg-cyber-bg relative overflow-hidden">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 border border-cyber-blue/20 relative">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-black mb-4 uppercase tracking-tight">
              TIZIMGA <span className="text-cyber-blue">KIRISH</span>
            </h2>
            <p className="text-slate-400 text-sm">Davom etish uchun hisobingizga kiring</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-cyber-red/10 border border-cyber-red/30 text-cyber-red text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="admin"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-cyber-blue transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-cyber-blue transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full cyber-button cyber-button-primary py-3 flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {isLoading ? 'KIRILMOQDA...' : 'KIRISH'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={onSwitchToRegister}
              className="text-xs text-slate-500 hover:text-cyber-blue transition-colors uppercase tracking-widest"
            >
              Hisobingiz yo'qmi? Ro'yxatdan o'ting
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
