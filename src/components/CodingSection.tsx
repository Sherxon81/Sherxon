import { useState } from 'react';
import { motion } from 'motion/react';
import { Code2, Play, CheckCircle2, Terminal, AlertCircle } from 'lucide-react';

const challenges = [
  {
    id: 1,
    title: "Ikki sonning yig'indisi",
    description: "Berilgan a va b sonlarining yig'indisini qaytaruvchi funksiya yozing.",
    starterCode: "function sum(a, b) {\n  // Kodni shu yerga yozing\n  \n}",
    testCase: { input: [5, 10], expected: 15 }
  },
  {
    id: 2,
    title: "Palindrom tekshiruvi",
    description: "Berilgan so'z palindrom ekanligini tekshiring (masalan: 'radar').",
    starterCode: "function isPalindrome(str) {\n  // Kodni shu yerga yozing\n  \n}",
    testCase: { input: ["radar"], expected: true }
  }
];

export default function CodingSection() {
  const [selectedId, setSelectedId] = useState(challenges[0].id);
  const [code, setCode] = useState(challenges[0].starterCode);
  const [output, setOutput] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

  const currentChallenge = challenges.find(c => c.id === selectedId)!;

  const runCode = () => {
    setStatus('running');
    setOutput(null);

    setTimeout(() => {
      try {
        // Simple and unsafe eval for demo purposes
        // In a real app, this would be handled by a secure backend sandbox
        const userFn = new Function(`return ${code}`)();
        const result = userFn(...currentChallenge.testCase.input);
        
        setOutput(result);
        if (result === currentChallenge.testCase.expected) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (err: any) {
        setOutput(err.message);
        setStatus('error');
      }
    }, 1000);
  };

  return (
    <section id="coding" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight mb-4">
          💻 KOD <span className="text-cyber-green">YAZISH</span>
        </h2>
        <p className="text-slate-400">Algoritmik topshiriqlarni yeching va mahoratingizni oshiring.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
        {/* Left: Challenge List & Desc */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
          {challenges.map(c => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedId(c.id);
                setCode(c.starterCode);
                setStatus('idle');
                setOutput(null);
              }}
              className={`p-6 rounded-2xl border text-left transition-all ${
                selectedId === c.id 
                  ? 'border-cyber-green bg-cyber-green/5 shadow-[0_0_20px_rgba(0,255,136,0.1)]' 
                  : 'border-white/5 bg-white/5 hover:border-white/20'
              }`}
            >
              <h3 className="font-bold text-white mb-2">{c.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{c.description}</p>
            </button>
          ))}
          
          <div className="mt-auto p-6 rounded-2xl bg-black/40 border border-white/5">
            <h4 className="text-xs font-mono text-cyber-green uppercase mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Topshiriq Tafsiloti
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              {currentChallenge.description}
            </p>
          </div>
        </div>

        {/* Right: Editor & Output */}
        <div className="flex flex-col glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="bg-white/5 p-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 ml-4 uppercase tracking-widest">index.js</span>
            </div>
            <button 
              onClick={runCode}
              disabled={status === 'running'}
              className="flex items-center gap-2 px-4 py-1.5 bg-cyber-green text-black text-xs font-bold rounded-lg hover:bg-white transition-colors disabled:opacity-50"
            >
              {status === 'running' ? <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
              RUN CODE
            </button>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-black/60 p-6 font-mono text-sm text-cyber-green focus:outline-none resize-none"
            spellCheck={false}
          />

          <div className="h-1/3 bg-black border-t border-white/10 p-6 font-mono">
            <div className="text-[10px] text-slate-500 uppercase mb-4 tracking-widest">Console Output</div>
            {output !== null ? (
              <div className={`text-sm ${status === 'success' ? 'text-cyber-green' : 'text-cyber-red'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{status === 'success' ? 'Testdan o\'tdi!' : 'Xatolik yuz berdi'}</span>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  Result: {JSON.stringify(output)}
                  {status === 'error' && <div className="mt-1 text-xs opacity-60">Expected: {JSON.stringify(currentChallenge.testCase.expected)}</div>}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-700 italic">Kodni ishga tushiring...</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
