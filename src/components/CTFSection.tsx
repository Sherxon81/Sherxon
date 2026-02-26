import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flag, Shield, Lock, Unlock, CheckCircle2, AlertCircle, Terminal, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Challenge {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Insane';
  points: number;
  description: string;
  hint?: string;
}

export default function CTFSection() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [flagInput, setFlagInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [solvedChallenges, setSolvedChallenges] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard' | 'Insane'>('All');

  useEffect(() => {
    setIsFetching(true);
    fetch('/api/challenges')
      .then(res => res.json())
      .then(data => {
        setChallenges(data);
        setIsFetching(false);
      })
      .catch(err => {
        console.error("Failed to fetch challenges:", err);
        setIsFetching(false);
      });
  }, []);

  const filteredChallenges = difficultyFilter === 'All' 
    ? challenges 
    : challenges.filter(c => c.difficulty === difficultyFilter);

  const handleSubmitFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallenge || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/challenges/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedChallenge.id, flag: flagInput.trim() })
      });
      const data = await response.json();

      if (data.success) {
        setStatus('success');
        if (!solvedChallenges.includes(selectedChallenge.id)) {
          setSolvedChallenges([...solvedChallenges, selectedChallenge.id]);
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00f3ff', '#00ff88', '#ffffff']
          });
        }
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2000);
      }
    } catch (error) {
      console.error("Failed to submit flag:", error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-cyber-green border-cyber-green/30 bg-cyber-green/5';
      case 'Medium': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5';
      case 'Hard': return 'text-orange-500 border-orange-500/30 bg-orange-500/5';
      case 'Insane': return 'text-cyber-red border-cyber-red/30 bg-cyber-red/5';
      default: return 'text-slate-400 border-white/10 bg-white/5';
    }
  };

  return (
    <section id="ctf" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight mb-4">
            🚩 CTF <span className="text-cyber-blue">CHALLENGES</span>
          </h2>
          <p className="text-slate-400">Bayroqlarni toping va ochkolarni to'plang. Har bir challenge o'ziga xos mahorat talab qiladi.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {(['All', 'Easy', 'Medium', 'Hard', 'Insane'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all rounded-lg ${
                difficultyFilter === diff
                  ? 'border-cyber-blue bg-cyber-blue/10 text-cyber-blue shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                  : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Challenge List */}
        <div className="lg:col-span-1 space-y-4">
          {isFetching ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-white/5 bg-cyber-card animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="w-16 h-4 bg-white/10 rounded" />
                  <div className="w-12 h-4 bg-white/10 rounded" />
                </div>
                <div className="w-full h-6 bg-white/10 rounded mb-2" />
                <div className="w-24 h-3 bg-white/10 rounded" />
              </div>
            ))
          ) : filteredChallenges.length > 0 ? (
            filteredChallenges.map((challenge) => (
              <div
                key={challenge.id}
                onClick={() => {
                  setSelectedChallenge(challenge);
                  setFlagInput('');
                  setStatus('idle');
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedChallenge?.id === challenge.id
                    ? 'border-cyber-blue bg-cyber-blue/10 shadow-[0_0_15px_rgba(0,243,255,0.1)]'
                    : 'border-white/5 bg-cyber-card hover:border-white/20'
                } ${solvedChallenges.includes(challenge.id) ? 'opacity-60' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{challenge.points} PTS</span>
                </div>
                <h3 className="font-display font-bold text-white flex items-center gap-2">
                  {solvedChallenges.includes(challenge.id) ? (
                    <CheckCircle2 className="w-4 h-4 text-cyber-green" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-600" />
                  )}
                  {challenge.title}
                </h3>
                <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{challenge.category}</div>
              </div>
            ))
          ) : (
            <div className="p-8 rounded-xl border border-white/5 bg-cyber-card text-center">
              <p className="text-slate-500 text-sm">Ushbu darajadagi topshiriqlar topilmadi.</p>
            </div>
          )}
        </div>

        {/* Challenge Detail & Submission */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedChallenge ? (
              <motion.div
                key={selectedChallenge.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-panel rounded-2xl p-8 border border-white/10 h-full flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-white mb-2">{selectedChallenge.title}</h3>
                    <div className="flex gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${getDifficultyColor(selectedChallenge.difficulty)}`}>
                        {selectedChallenge.difficulty}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-cyber-blue/30 bg-cyber-blue/5 text-cyber-blue uppercase tracking-widest">
                        {selectedChallenge.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-3xl font-display font-black text-white">
                    {selectedChallenge.points} <span className="text-sm text-slate-500 font-normal">PTS</span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="bg-black/40 rounded-xl p-6 border border-white/5 mb-8">
                    <div className="flex items-center gap-2 text-cyber-blue mb-4 text-sm font-mono">
                      <Terminal className="w-4 h-4" />
                      <span>DESCRIPTION</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-sans">
                      {selectedChallenge.description}
                    </p>
                  </div>

                  {selectedChallenge.hint && (
                    <div className="mb-8">
                      <button className="text-xs text-slate-500 hover:text-cyber-blue transition-colors flex items-center gap-1 font-mono uppercase tracking-widest">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Maslahat (Hint) ko'rish
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                  <form onSubmit={handleSubmitFlag} className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={flagInput}
                        onChange={(e) => setFlagInput(e.target.value)}
                        placeholder="CTF{flag_format}"
                        disabled={solvedChallenges.includes(selectedChallenge.id) || isSubmitting}
                        className={`w-full bg-black/60 border rounded-xl px-6 py-4 text-white font-mono focus:outline-none transition-all ${
                          status === 'success' ? 'border-cyber-green' : 
                          status === 'error' ? 'border-cyber-red' : 
                          'border-white/10 focus:border-cyber-blue'
                        } ${isSubmitting ? 'opacity-50' : ''}`}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {isSubmitting ? (
                          <Loader2 className="text-cyber-blue w-6 h-6 animate-spin" />
                        ) : (
                          <>
                            {status === 'success' && <CheckCircle2 className="text-cyber-green w-6 h-6" />}
                            {status === 'error' && <AlertCircle className="text-cyber-red w-6 h-6" />}
                          </>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider px-2">
                      Format: <span className="text-cyber-blue">CTF{"{your_flag_here}"}</span>
                    </p>
                    
                    {!solvedChallenges.includes(selectedChallenge.id) ? (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full cyber-button cyber-button-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Flag className="w-5 h-5" />
                        )}
                        {isSubmitting ? 'TEKSHIRILMOQDA...' : 'Bayroqni Topshirish'}
                      </button>
                    ) : (
                      <div className="w-full py-4 rounded-xl bg-cyber-green/10 border border-cyber-green/30 text-cyber-green font-display font-bold text-center uppercase tracking-widest">
                        Muvaffaqiyatli yechildi!
                      </div>
                    )}
                  </form>
                </div>
              </motion.div>
            ) : (
              <div className="glass-panel rounded-2xl p-8 border border-white/10 h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <Shield className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">Challenge Tanlang</h3>
                <p className="text-slate-500 max-w-xs">
                  Chap tomondagi ro'yxatdan biror bir challengeni tanlang va bayroqni qidirishni boshlang.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
