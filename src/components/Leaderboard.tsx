import { Trophy, Medal, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Leaderboard() {
  const [topHackers, setTopHackers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => setTopHackers(data))
      .catch(err => console.error("Failed to fetch leaderboard:", err));
  }, []);

  return (
    <section id="leaderboard" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-display font-black mb-4 uppercase tracking-tight">
            🏆 TOP <span className="text-cyber-blue">HAKERLAR</span> REYTINGI
          </h2>
          <p className="text-slate-400">Eng yaxshi hakerlar va ularning natijalari</p>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">O'rin</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Haker</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Ball</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Konkurslar</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Davlat</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topHackers.map((hacker) => (
                  <tr key={hacker.username} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        {hacker.rank === 1 && <Crown className="w-5 h-5 text-yellow-500" />}
                        {hacker.rank === 2 && <Medal className="w-5 h-5 text-slate-400" />}
                        {hacker.rank === 3 && <Medal className="w-5 h-5 text-amber-600" />}
                        <span className={`font-mono font-bold ${hacker.rank <= 3 ? 'text-white' : 'text-slate-500'}`}>
                          {hacker.rank < 10 ? `0${hacker.rank}` : hacker.rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-cyber-blue group-hover:border-cyber-blue/50 transition-colors">
                          {hacker.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white">{hacker.name}</div>
                          <div className="text-xs text-cyber-green font-mono">@{hacker.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="font-mono font-bold text-lg text-white group-hover:text-cyber-blue transition-colors">
                        {hacker.score.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-slate-400 font-mono">{hacker.competitions}</td>
                    <td className="px-6 py-6 text-slate-400 font-mono">{hacker.country}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${hacker.status === 'online' ? 'bg-cyber-green animate-pulse' : 'bg-slate-700'}`} />
                        <span className={`text-xs uppercase tracking-widest font-bold ${hacker.status === 'online' ? 'text-cyber-green' : 'text-slate-600'}`}>
                          {hacker.status === 'online' ? 'Onlayn' : 'Oflayn'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
