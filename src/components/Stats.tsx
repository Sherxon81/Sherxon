import { Trophy, DollarSign, Bug } from 'lucide-react';

const stats = [
  { label: "RO'YXATDAN O'TGAN HAKERLAR", value: '10,842', icon: UserSecret, color: '#00f3ff' },
  { label: "O'TKAZILGAN KONKURSLAR", value: '248', icon: Trophy, color: '#00ff88' },
  { label: "TAQSIMLANGAN MUKOFOTLAR", value: '$1.2M', icon: DollarSign, color: '#ff003c' },
  { label: "TOPILGAN ZAIFLIKLAR", value: '3,456', icon: Bug, color: '#9d4edd' },
];

export default function Stats() {
  return (
    <section className="py-20 bg-white/[0.02] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center group">
              <div 
                className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <div 
                className="text-4xl font-display font-black mb-2"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Mock UserSecret icon since it's not in standard lucide
function UserSecret({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M2 21a8 8 0 0 1 13.292-6" />
      <circle cx="10" cy="8" r="5" />
      <path d="M19 16v6" />
      <path d="M22 19h-6" />
    </svg>
  );
}
