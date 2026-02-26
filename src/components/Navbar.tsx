import { Shield, Menu, X, User, Trophy, Terminal, LogOut } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  onLoginClick: () => void;
}

export default function Navbar({ user, onLogout, onLoginClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Konkurslar', href: '#contests' },
    { name: 'CTF', href: '#ctf' },
    { name: 'Reyting', href: '#leaderboard' },
    ...(user ? [] : [{ name: 'Ro\'yxatdan o\'tish', href: '#register' }]),
    ...(user?.role === 'admin' ? [{ name: 'Admin', href: '#admin' }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyber-blue rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.3)]">
              <Shield className="text-black w-6 h-6" />
            </div>
            <span className="text-xl font-display font-bold tracking-tighter text-white">
              CYBER<span className="text-cyber-blue">CHAMPIONS</span>
            </span>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-slate-400 hover:text-cyber-blue transition-colors uppercase tracking-widest"
                >
                  {link.name}
                </a>
              ))}
              
              {user ? (
                <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-white uppercase tracking-widest">{user.username}</span>
                    <span className="text-[10px] text-cyber-green font-mono uppercase">{user.role}</span>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="p-2 text-slate-400 hover:text-cyber-red transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="cyber-button cyber-button-primary text-xs"
                >
                  Kirish
                </button>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-400 hover:text-white p-2"
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-cyber-bg border-b border-white/10"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-4 text-base font-medium text-slate-400 hover:text-cyber-blue hover:bg-white/5 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4">
                {user ? (
                  <button 
                    onClick={() => { onLogout(); setIsOpen(false); }}
                    className="w-full cyber-button border border-cyber-red text-cyber-red"
                  >
                    Chiqish
                  </button>
                ) : (
                  <button 
                    onClick={() => { onLoginClick(); setIsOpen(false); }}
                    className="w-full cyber-button cyber-button-primary"
                  >
                    Kirish
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
