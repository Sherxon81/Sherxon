import { motion } from 'motion/react';
import { Rocket, Eye, Terminal, ShieldAlert } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
  onViewCompetitions: () => void;
}

export default function Hero({ onStart, onViewCompetitions }: HeroProps) {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full matrix-bg -z-10 opacity-20" />
      <div className="absolute top-20 left-1/4 w-64 h-64 bg-cyber-blue/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyber-purple/10 rounded-full blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-cyber-blue mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-blue opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-blue"></span>
            </span>
            SYSTEM STATUS: ONLINE // 1,078 HACKERS ACTIVE
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter mb-6 leading-none">
            HACK • COMPETE <br />
            <span className="text-cyber-blue glow-text-blue">EARN REWARDS</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-10 font-sans leading-relaxed">
            Kiberxavfsizlik olamida o'zingizni sinab ko'ring. CTF musobaqalari, 
            bug bounty dasturlari va dasturlash konkurslari.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto cyber-button cyber-button-primary flex items-center justify-center gap-2 py-4 px-8"
            >
              <Rocket className="w-5 h-5" />
              Qatnashishni Boshlash
            </button>
            <button 
              onClick={onViewCompetitions}
              className="w-full sm:w-auto cyber-button cyber-button-outline flex items-center justify-center gap-2 py-4 px-8"
            >
              <Eye className="w-5 h-5" />
              Konkurslarni Ko'rish
            </button>
          </div>
        </motion.div>

        {/* Terminal Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-20 max-w-4xl mx-auto glass-panel rounded-xl overflow-hidden shadow-2xl border border-white/10"
        >
          <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              root@cyberchampions:~# monitoring
            </div>
            <div className="w-10" />
          </div>
          <div className="p-6 text-left font-mono text-sm md:text-base space-y-2">
            <div className="flex gap-2">
              <span className="text-cyber-green">$&gt;</span>
              <span className="text-white">active_konkurslarni_skanerla</span>
            </div>
            <div className="text-slate-500">
              [✓] 4 ta faol konkurs topildi<br />
              [✓] 1,078 jami onlayn ishtirokchi<br />
              [✓] $26,500 jami mukofot jamg'armasi<br />
              [!] Yangi zaiflik topshirildi: CVE-2024-12345
            </div>
            <div className="flex gap-2">
              <span className="text-cyber-green">$&gt;</span>
              <span className="text-white">eng_yaxshi_hakerlarni_ko'rsat</span>
            </div>
            <div className="text-slate-400">
              1. Sherxon_75 - 3,450 ball <span className="text-cyber-green">[ONLINE]</span><br />
              2. zero_cool - 2,210 ball <span className="text-cyber-blue">[COMPETING]</span><br />
              3. crypto_master - 1,980 ball <span className="text-slate-600">[OFFLINE]</span>
            </div>
            <div className="flex gap-2">
              <span className="text-cyber-green">$&gt;</span>
              <span className="animate-pulse">_</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
