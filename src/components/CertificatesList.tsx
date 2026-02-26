import { useState, useEffect, useRef } from 'react';
import { Award, Download, Calendar, ShieldCheck, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Certificate {
  id: string;
  quiz_title: string;
  issue_date: string;
  certificate_code: string;
}

export default function CertificatesList({ userId, updateTrigger }: { userId: number, updateTrigger?: number }) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const certRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetch(`/api/users/${userId}/certificates`)
      .then(res => res.json())
      .then(data => {
        setCertificates(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [userId, updateTrigger]);

  const downloadPDF = async (cert: Certificate) => {
    const element = certRefs.current[cert.id];
    if (!element) return;

    setIsDownloading(cert.id);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0a0a0a',
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Certificate-${cert.quiz_title}-${cert.id}.pdf`);
    } catch (error) {
      console.error("PDF download error:", error);
    } finally {
      setIsDownloading(null);
    }
  };

  if (isLoading) {
    return <div className="text-slate-500 font-mono text-xs animate-pulse">Sertifikatlar yuklanmoqda...</div>;
  }

  if (certificates.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-2xl border border-white/5 text-center">
        <Award className="w-12 h-12 text-slate-700 mx-auto mb-4" />
        <p className="text-slate-500">Sizda hali sertifikatlar yo'q. Testlardan o'ting va sertifikatlar oling!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {certificates.map((cert) => (
        <div key={cert.id} className="relative group">
          {/* Hidden Certificate Template for PDF Generation */}
          <div 
            ref={el => certRefs.current[cert.id] = el}
            className="fixed -left-[9999px] top-0 w-[800px] p-12 bg-[#0a0a0a] border-[16px] border-cyber-green/20 text-center font-sans"
          >
            <div className="border-4 border-cyber-green/30 p-12 relative">
              <ShieldCheck className="w-24 h-24 text-cyber-green/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="relative z-10">
                <div className="text-cyber-green font-mono text-sm uppercase tracking-[0.3em] mb-8">Certificate of Achievement</div>
                <h1 className="text-5xl font-black text-white mb-4 uppercase tracking-tight">CYBER CHAMPIONS</h1>
                <div className="w-24 h-1 bg-cyber-green mx-auto mb-12" />
                <p className="text-slate-400 text-lg mb-2 italic">Ushbu sertifikat bilan tasdiqlanadi:</p>
                <h2 className="text-3xl font-bold text-white mb-12 border-b-2 border-white/10 inline-block px-8 pb-2">FOYDALANUVCHI</h2>
                <p className="text-slate-400 text-lg mb-8">
                  <span className="text-white font-bold">{cert.quiz_title}</span> testi bo'yicha muvaffaqiyatli natija ko'rsatgani uchun topshirildi.
                </p>
                <div className="grid grid-cols-2 gap-12 mt-16 text-left">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Berilgan sana</div>
                    <div className="text-white font-mono">{new Date(cert.issue_date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Sertifikat ID</div>
                    <div className="text-white font-mono">{cert.id}</div>
                  </div>
                </div>
                <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-end">
                  <div className="text-[8px] text-slate-600 font-mono uppercase tracking-widest">Verification Code: {cert.certificate_code}</div>
                  <div className="text-cyber-green font-black text-xl italic">CYBERCHAMPIONS.UZ</div>
                </div>
              </div>
            </div>
          </div>

          {/* Visible Card */}
          <div className="glass-panel p-6 rounded-2xl border border-cyber-green/20 hover:border-cyber-green/50 transition-all group relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-20 h-20 text-cyber-green" />
            </div>
            
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-cyber-green/10 rounded-xl flex items-center justify-center text-cyber-green">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{cert.quiz_title}</h3>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono uppercase">
                  <Calendar className="w-3 h-3" />
                  {new Date(cert.issue_date).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-auto">
              <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">Sertifikat kodi</div>
                <div className="text-xs font-mono text-cyber-green truncate">{cert.certificate_code}</div>
              </div>
              
              <button 
                onClick={() => downloadPDF(cert)}
                disabled={isDownloading === cert.id}
                className="w-full cyber-button border border-cyber-green/30 text-cyber-green text-xs py-2 flex items-center justify-center gap-2 hover:bg-cyber-green/10 transition-colors disabled:opacity-50"
              >
                {isDownloading === cert.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                {isDownloading === cert.id ? 'TAYYORLANMOQDA...' : 'YUKLAB OLISH (PDF)'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
