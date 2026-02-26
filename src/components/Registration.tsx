import { useState } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Mail, Lock, User, ShieldCheck, AlertCircle } from 'lucide-react';

interface RegistrationProps {
  onRegister: (user: any) => void;
  onSwitchToLogin: () => void;
}

export default function Registration({ onRegister, onSwitchToLogin }: RegistrationProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        onRegister(data.user);
      } else {
        setError(data.error || "Ro'yxatdan o'tishda xatolik yuz berdi");
      }
    } catch (err) {
      setError("Server bilan aloqa uzildi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="register" className="py-20 bg-cyber-bg relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-blue to-transparent opacity-20" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 md:p-12 border border-cyber-blue/20 relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-cyber-blue text-black px-6 py-2 rounded-full font-display font-bold text-sm shadow-[0_0_20px_rgba(0,243,255,0.4)]">
            JOIN THE ELITE
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-black mb-4 uppercase tracking-tight">
              RO'YXATDAN <span className="text-cyber-blue">O'TISH</span>
            </h2>
            <p className="text-slate-400">O'z mahoratingizni ko'rsatish va mukofotlar yutish uchun profil yarating</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-cyber-red/10 border border-cyber-red/30 text-cyber-red text-xs flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="hacker_name"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-cyber-blue transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="root@example.com"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-cyber-blue transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Password</label>
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
              <div className="pt-7">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full cyber-button cyber-button-primary py-3 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  {isLoading ? 'YARATILMOQDA...' : 'HISOB YARATISH'}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={onSwitchToLogin}
              className="text-xs text-slate-500 hover:text-cyber-blue transition-colors uppercase tracking-widest"
            >
              Hisobingiz bormi? Kirish
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-slate-500 font-mono">
            <ShieldCheck className="w-4 h-4 text-cyber-green" />
            <span>SIZNING MA'LUMOTLARINGIZ SHIFRLANGAN VA XAVFSIZ</span>
          </div>
        </div>
      </div>
    </section>
  );
}
