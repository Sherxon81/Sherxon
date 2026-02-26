import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, Sparkles, ShieldCheck, Cpu, Globe, Code2, Search, Microscope, Undo2, Lock, X } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CompetitionCard from './components/CompetitionCard';
import Leaderboard from './components/Leaderboard';
import Stats from './components/Stats';
import CTFSection from './components/CTFSection';
import Registration from './components/Registration';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';

const categories = [
  { name: 'Capture The Flag (CTF)', icon: Globe, desc: 'Kiberxavfsizlikni o\'rganish va amaliyot o\'tash uchun eng yaxshi yo\'l.', color: 'text-cyber-blue' },
  { name: 'Bug Bounty Dasturlari', icon: Search, desc: 'Haqiqiy tizimlardagi zaifliklarni toping va real pul mukofotlarini yuting.', color: 'text-yellow-500' },
  { name: 'Xavfsiz Dasturlash', icon: Code2, desc: 'Xavfsiz dasturlash bo\'yicha musobaqalar. Algoritmlar, shifrlash usullari.', color: 'text-cyber-green' },
  { name: 'Penetration Testing', icon: ShieldCheck, desc: 'To\'liq pentest laboratoriyalari. Network scanning, vulnerability assessment.', color: 'text-cyber-red' },
  { name: 'Digital Forensics', icon: Microscope, desc: 'Raqamli dalillarni tahlil qilish. Memory analysis, traffic analysis.', color: 'text-cyber-purple' },
  { name: 'Reverse Engineering', icon: Undo2, desc: 'Dasturlarni teskari muhandislik qilish. Malware analysis, crackmes.', color: 'text-orange-500' },
];

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authView, setAuthView] = useState<'login' | 'register' | null>(null);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Salom! Men CyberChampions AI yordamchisiman. Kiberxavfsizlik yoki konkurslar haqida savolingiz bormi?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: "Siz CyberChampions platformasining AI yordamchisiz. Kiberxavfsizlik, CTF, Bug Bounty va dasturlash bo'yicha mutaxassissiz. Foydalanuvchilarga o'zbek tilida qisqa va aniq javob bering. Hacking bo'yicha noqonuniy so'rovlarni rad eting va etik hakerlikni targ'ib qiling."
        }
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.text || "Kechirasiz, javob olishda xatolik yuz berdi." }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Tizimda xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring." }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    // Load user from localStorage if exists
    const savedUser = localStorage.getItem('cyber_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    fetch('/api/competitions')
      .then(res => res.json())
      .then(data => setCompetitions(data))
      .catch(err => console.error("Failed to fetch competitions:", err));
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('cyber_user', JSON.stringify(userData));
    setAuthView(null);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cyber_user');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAuthClick = (view: 'login' | 'register') => {
    setAuthView(view);
    setTimeout(() => scrollToSection('auth-section'), 50);
  };

  return (
    <div className="min-h-screen relative">
      <div className="scanline" />
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onLoginClick={() => handleAuthClick('login')} 
      />
      
      <main>
        <Hero 
          onStart={() => {
            if (!user) {
              handleAuthClick('register');
            } else {
              scrollToSection('ctf');
            }
          }}
          onViewCompetitions={() => scrollToSection('contests')}
        />
        
        <div id="auth-section">
          <AnimatePresence mode="wait">
            {!user && authView && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {authView === 'register' ? (
                  <Registration 
                    onRegister={handleLogin} 
                    onSwitchToLogin={() => setAuthView('login')} 
                  />
                ) : (
                  <Login 
                    onLogin={handleLogin} 
                    onSwitchToRegister={() => setAuthView('register')} 
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <Stats />

        {user ? (
          <>
            <CTFSection />

            {/* Live Contests Section */}
            <section id="contests" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                <div>
                  <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight mb-4">
                    🔴 JORIY <span className="text-cyber-blue">KONKURSLAR</span>
                  </h2>
                  <p className="text-slate-400">Hozir o'tayotgan musobaqalarda qatnashing va o'z mahoratingizni ko'rsating</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors">
                    Barchasi
                  </button>
                  <button className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-cyber-blue/30 bg-cyber-blue/5 text-cyber-blue">
                    Faol
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {competitions.map((comp, idx) => (
                  <CompetitionCard key={idx} {...comp} />
                ))}
              </div>
            </section>

            <Leaderboard />

            {user.role === 'admin' && <AdminPanel />}
          </>
        ) : (
          <section className="py-24 bg-black/20 border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <div className="w-20 h-20 bg-cyber-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-cyber-blue" />
              </div>
              <h2 className="text-3xl font-display font-black mb-4 uppercase">KONTENT <span className="text-cyber-blue">YASHIRILGAN</span></h2>
              <p className="text-slate-400 max-w-md mx-auto mb-8">
                Musobaqalar va CTF topshiriqlarini ko'rish uchun tizimga kiring yoki ro'yxatdan o'ting.
              </p>
              <button 
                onClick={() => handleAuthClick('login')}
                className="cyber-button cyber-button-primary px-10 py-4"
              >
                Hozir Kirish
              </button>
            </div>
          </section>
        )}

        {/* Categories Section */}
        <section id="categories" className="py-24 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight mb-4">
                🎯 KONKURS <span className="text-cyber-purple">YO'NALISHLARI</span>
              </h2>
              <p className="text-slate-400">Har qanday darajadagi hakerlar va dasturchilar uchun</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  className="p-8 rounded-2xl bg-cyber-card border border-white/5 hover:border-white/20 transition-all group"
                >
                  <cat.icon className={`w-10 h-10 mb-6 ${cat.color} group-hover:scale-110 transition-transform`} />
                  <h3 className="text-xl font-display font-bold mb-4">{cat.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{cat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        {!user && (
          <section className="py-24">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative p-12 rounded-3xl overflow-hidden text-center border border-cyber-blue/20 bg-gradient-to-br from-cyber-blue/10 to-transparent">
                <div className="absolute top-0 left-0 w-full h-full matrix-bg opacity-10 -z-10" />
                <h2 className="text-4xl md:text-6xl font-display font-black mb-6 uppercase tracking-tight">
                  HAKERLIKNI <span className="text-cyber-blue">BOSHLANG</span>
                </h2>
                <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                  Bugun ro'yxatdan o'ting va O'zbekistonning eng kuchli kiberxavfsizlik hamjamiyatiga qo'shiling.
                </p>
                <button 
                  onClick={() => setAuthView('register')}
                  className="cyber-button cyber-button-primary py-5 px-12 text-lg"
                >
                  Hozir Ro'yxatdan O'tish
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="text-cyber-blue w-8 h-8" />
                <span className="text-xl font-display font-bold tracking-tighter text-white">
                  CYBER<span className="text-cyber-blue">CHAMPIONS</span>
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Kiberxavfsizlik va dasturlash bo'yicha O'zbekistonning yetakchi onlayn konkurs platformasi. #SecureTheFuture
              </p>
            </div>
            <div>
              <h4 className="font-display font-bold text-white mb-6 uppercase tracking-widest text-sm">Konkurslar</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-cyber-blue transition-colors">CTF Challenges</a></li>
                <li><a href="#" className="hover:text-cyber-blue transition-colors">Bug Bounty</a></li>
                <li><a href="#" className="hover:text-cyber-blue transition-colors">Secure Coding</a></li>
                <li><a href="#" className="hover:text-cyber-blue transition-colors">Pentesting</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-white mb-6 uppercase tracking-widest text-sm">Resurslar</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-cyber-blue transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-cyber-blue transition-colors">CTF Writeups</a></li>
                <li><a href="#" className="hover:text-cyber-blue transition-colors">Tools</a></li>
                <li><a href="#" className="hover:text-cyber-blue transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-white mb-6 uppercase tracking-widest text-sm">Aloqa</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-cyber-blue transition-colors">Biz haqimizda</a></li>
                <li><a href="#" className="hover:text-cyber-blue transition-colors">Karyera</a></li>
                <li><a href="#" className="hover:text-cyber-blue transition-colors">Hamkorlik</a></li>
                <li><a href="#" className="hover:text-cyber-blue transition-colors">Qoidalar</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600 font-mono">
            <div>© 2024 CYBERCHAMPIONS. BARCHA HUQUQLAR HIMOYALANGAN.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">PRIVACY POLICY</a>
              <a href="#" className="hover:text-white transition-colors">TERMS OF SERVICE</a>
              <a href="#" className="hover:text-white transition-colors">COOKIE SETTINGS</a>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Assistant Toggle */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-16 h-16 rounded-full bg-cyber-blue text-black shadow-[0_0_20px_rgba(0,243,255,0.4)] flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
        >
          {isChatOpen ? <X className="w-8 h-8" /> : <Bot className="w-8 h-8" />}
        </button>

        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[500px] glass-panel rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-cyber-blue/30"
            >
              <div className="bg-cyber-blue p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                  <Sparkles className="text-cyber-blue w-4 h-4" />
                </div>
                <div>
                  <div className="text-black font-bold text-sm">CYBER AI ASSISTANT</div>
                  <div className="text-black/60 text-[10px] font-bold uppercase tracking-widest">Online // Ready to help</div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/40">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-cyber-blue text-black font-medium rounded-tr-none' 
                        : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 p-3 rounded-xl rounded-tl-none border border-white/10">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-cyber-blue rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-cyber-blue rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-cyber-blue rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-black/60 border-t border-white/10">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex gap-2"
                >
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Savolingizni yozing..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyber-blue transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={isTyping}
                    className="w-10 h-10 bg-cyber-blue text-black rounded-lg flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
