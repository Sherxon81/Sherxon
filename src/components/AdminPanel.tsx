import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, LayoutDashboard, Trophy, Clock, Users, BookOpen, Mail, Shield } from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'competitions' | 'users' | 'quizzes'>('competitions');
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [newComp, setNewComp] = useState({
    title: '',
    type: 'CTF',
    prize: '',
    description: '',
    timeLeft: '',
    participants: 0,
    color: '#00f3ff'
  });

  const fetchData = async () => {
    try {
      if (activeTab === 'competitions') {
        const res = await fetch('/api/competitions');
        const data = await res.json();
        setCompetitions(data);
      } else if (activeTab === 'users') {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComp)
      });
      if (res.ok) {
        fetchData();
        setNewComp({
          title: '',
          type: 'CTF',
          prize: '',
          description: '',
          timeLeft: '',
          participants: 0,
          color: '#00f3ff'
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/admin/competitions/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section id="admin" className="py-24 bg-black/40 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 bg-cyber-purple/20 rounded-xl flex items-center justify-center text-cyber-purple">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-display font-black uppercase tracking-tight">ADMIN <span className="text-cyber-purple">PANEL</span></h2>
            <p className="text-slate-500 text-sm">Platformani to'liq nazorat qilish va boshqarish</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/5 pb-4">
          <button 
            onClick={() => setActiveTab('competitions')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'competitions' ? 'bg-cyber-blue text-black' : 'text-slate-500 hover:text-white'}`}
          >
            <Trophy className="w-4 h-4" />
            Musobaqalar
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-cyber-blue text-black' : 'text-slate-500 hover:text-white'}`}
          >
            <Users className="w-4 h-4" />
            Foydalanuvchilar
          </button>
          <button 
            onClick={() => setActiveTab('quizzes')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'quizzes' ? 'bg-cyber-blue text-black' : 'text-slate-500 hover:text-white'}`}
          >
            <BookOpen className="w-4 h-4" />
            Testlar
          </button>
        </div>

        {activeTab === 'competitions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Add Form */}
            <div className="lg:col-span-1">
              <div className="glass-panel rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-display font-bold mb-6 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-cyber-blue" />
                  YANGI MUSOBAQA
                </h3>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Sarlavha</label>
                    <input
                      type="text"
                      required
                      value={newComp.title}
                      onChange={(e) => setNewComp({...newComp, title: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-cyber-blue outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Tur</label>
                      <select
                        value={newComp.type}
                        onChange={(e) => setNewComp({...newComp, type: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-cyber-blue outline-none"
                      >
                        <option value="CTF">CTF</option>
                        <option value="BUG BOUNTY">BUG BOUNTY</option>
                        <option value="CODING">CODING</option>
                        <option value="WEB PENTEST">WEB PENTEST</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Mukofot</label>
                      <input
                        type="text"
                        required
                        value={newComp.prize}
                        onChange={(e) => setNewComp({...newComp, prize: e.target.value})}
                        placeholder="$1,000"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-cyber-blue outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Tavsif</label>
                    <textarea
                      required
                      value={newComp.description}
                      onChange={(e) => setNewComp({...newComp, description: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-cyber-blue outline-none h-24 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Vaqt</label>
                      <input
                        type="text"
                        required
                        value={newComp.timeLeft}
                        onChange={(e) => setNewComp({...newComp, timeLeft: e.target.value})}
                        placeholder="24:00:00"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-cyber-blue outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Rang</label>
                      <input
                        type="color"
                        value={newComp.color}
                        onChange={(e) => setNewComp({...newComp, color: e.target.value})}
                        className="w-full h-9 bg-black/40 border border-white/10 rounded-lg px-1 py-1 cursor-pointer"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full cyber-button cyber-button-primary py-3 text-sm">
                    QO'SHISH
                  </button>
                </form>
              </div>
            </div>

            {/* List */}
            <div className="lg:col-span-2">
              <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Musobaqa</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Tur / Mukofot</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {competitions.map((comp) => (
                      <tr key={comp.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{comp.title}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">{comp.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-white/10 bg-white/5 text-slate-400">
                              {comp.type}
                            </span>
                            <span className="text-sm font-bold text-cyber-green">{comp.prize}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(comp.id)}
                            className="p-2 text-slate-500 hover:text-cyber-red transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Foydalanuvchi</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Email</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Rol</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyber-blue/10 flex items-center justify-center text-cyber-blue font-bold text-xs">
                        {u.username[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-white">{u.username}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {u.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-widest ${
                        u.role === 'admin' ? 'border-cyber-red text-cyber-red bg-cyber-red/5' : 'border-cyber-blue text-cyber-blue bg-cyber-blue/5'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500 text-xs font-mono">
                      <div className="flex items-center justify-end gap-2">
                        <Clock className="w-3 h-3" />
                        {new Date(u.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="text-center py-20 glass-panel rounded-2xl border border-white/10">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-white mb-2">Testlarni Boshqarish</h3>
            <p className="text-slate-500 max-w-xs mx-auto">Tez kunda: Yangi testlar qo'shish va savollarni tahrirlash imkoniyati.</p>
          </div>
        )}
      </div>
    </section>
  );
}
