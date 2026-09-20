import { useTournament } from '../game/tournamentContext';
import { Play } from 'lucide-react';

export function Home() {
  const { startTournament } = useTournament();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 relative">
      
      {/* Decorative center element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/5 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5 pointer-events-none"></div>

      <div className="z-10 text-center max-w-2xl mx-auto flex flex-col items-center">
        
        <div className="mb-4">
          <span className="text-[#D4AF37] font-semibold tracking-[0.5em] text-sm uppercase">Welcome to the</span>
        </div>

        <h1 className="font-cinzel text-6xl md:text-8xl font-black tracking-widest text-[#F5F0E6] drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] mb-2 flex flex-col">
          <span>HOUSE <span className="text-[#D4AF37] text-4xl align-middle mx-4">OF</span></span>
          <span className="text-[#D4AF37]">FORTUNE</span>
        </h1>

        <p className="text-gray-400 mt-6 mb-12 max-w-lg mx-auto text-lg leading-relaxed">
          The ultimate high-stakes casino tournament. Survive three grueling stages. Risk your chips, secure your rewards, and face the final vault.
        </p>

        <button 
          onClick={startTournament}
          className="premium-btn text-lg px-12 py-4 flex items-center gap-3 group"
        >
          <Play className="w-5 h-5 group-hover:scale-110 transition-transform text-[#D4AF37]" />
          Enter the Tournament
        </button>
        
        <div className="mt-16 text-xs text-gray-600 uppercase tracking-widest border border-white/10 px-6 py-3 rounded bg-black/40">
          <p>Stage 1: The Table <span className="mx-2">•</span> Stage 2: The Wheel <span className="mx-2">•</span> Stage 3: The Vault</p>
        </div>

      </div>
    </div>
  );
}
