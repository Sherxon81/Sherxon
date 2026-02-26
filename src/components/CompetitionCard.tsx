import { Clock, Users, Trophy, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface CompetitionProps {
  title: string;
  type: 'CTF' | 'BUG BOUNTY' | 'CODING' | 'WEB PENTEST';
  prize: string;
  description: string;
  timeLeft: string;
  participants: number;
  color: string;
}

export default function CompetitionCard({ 
  title, 
  type, 
  prize, 
  description, 
  timeLeft, 
  participants,
  color 
}: CompetitionProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="neon-border bg-cyber-card p-6 rounded-xl group cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <span 
          className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest"
          style={{ 
            color: color, 
            borderColor: `${color}40`,
            backgroundColor: `${color}10`
          }}
        >
          {type}
        </span>
        <div className="text-xl font-display font-bold text-white">
          {prize}
        </div>
      </div>

      <h3 className="text-xl font-display font-bold mb-3 group-hover:text-cyber-blue transition-colors">
        {title}
      </h3>
      
      <p className="text-sm text-slate-400 mb-6 line-clamp-2 font-sans leading-relaxed">
        {description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users className="w-3.5 h-3.5" />
            <span>{participants}</span>
          </div>
        </div>
        
        <div className="text-cyber-blue opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}
