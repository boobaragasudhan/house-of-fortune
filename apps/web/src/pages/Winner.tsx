import React from 'react';
import { useTournament } from '../game/tournamentContext';
import { Trophy, RefreshCw } from 'lucide-react';
import { HoFEmblem } from '../components/HoFEmblem';
import { AnimatedCounter } from '../components/AnimatedCounter';

export const Winner: React.FC = () => {
  const { gameState, startTournament } = useTournament();

  const isChampion = gameState.gameStatus === 'CHAMPION' || (gameState.stage === 5 && !gameState.cashedOut);
  const reward = gameState.securedReward + gameState.totalTournamentReward;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 relative bg-[radial-gradient(ellipse_at_50%_50%,rgba(6,59,42,0.2)_0%,#040404_70%)]">
      
      <div className="z-10 text-center max-w-xl mx-auto flex flex-col items-center bg-[#090909]/90 p-10 rounded-2xl border border-[#063B2A] shadow-[0_15px_60px_rgba(0,0,0,0.9)] backdrop-blur-md space-y-6">
        
        {/* Emblem */}
        <div className="mb-2">
          {isChampion ? (
            <HoFEmblem size={90} glowIntensity={0.8} />
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-950/40 border border-red-800 flex items-center justify-center text-red-400">
              <Trophy className="w-10 h-10" />
            </div>
          )}
        </div>

        <div>
          <span className={`text-xs uppercase font-bold tracking-[0.4em] ${isChampion ? 'text-[#D4AF37]' : 'text-red-400'}`}>
            {gameState.cashedOut ? 'TOURNAMENT CASHOUT' : (isChampion ? 'GRAND CHAMPION' : 'TOURNAMENT COMPLETED')}
          </span>
          <h1 className="font-cinzel text-4xl md:text-5xl font-black tracking-widest text-[#F5F0E6] mt-1">
            {gameState.playerName || 'BOOBA'}
          </h1>
          <p className="text-emerald-400 font-cinzel text-lg tracking-wider uppercase font-semibold mt-0.5">
            {gameState.teamName || 'HOUSE OF BOOBA'}
          </p>
        </div>

        {/* Final Reward Box */}
        <div className="w-full bg-[#04261D]/80 border border-[#063B2A] p-6 rounded-xl space-y-2">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-widest block">FINAL TOURNAMENT REWARD</span>
          <div className="text-4xl md:text-5xl font-extrabold font-mono text-[#D4AF37]">
            <AnimatedCounter value={reward} suffix=" COINS" />
          </div>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Virtual Tournament Credits</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 w-full text-center">
          <div className="bg-black/50 border border-white/5 p-3 rounded-lg">
            <span className="text-[9px] uppercase text-gray-400 font-bold block">ROUNDS</span>
            <span className="font-mono text-sm font-bold text-white">{gameState.stage} / 5</span>
          </div>
          <div className="bg-black/50 border border-white/5 p-3 rounded-lg">
            <span className="text-[9px] uppercase text-gray-400 font-bold block">SECURED</span>
            <span className="font-mono text-sm font-bold text-emerald-400">{gameState.securedReward.toLocaleString()}</span>
          </div>
          <div className="bg-black/50 border border-white/5 p-3 rounded-lg">
            <span className="text-[9px] uppercase text-gray-400 font-bold block">STATUS</span>
            <span className="font-mono text-xs font-bold text-[#D4AF37] uppercase">{gameState.cashedOut ? 'CASHED OUT' : isChampion ? 'WON' : 'DONE'}</span>
          </div>
        </div>

        <button 
          onClick={startTournament}
          className="w-full py-4 bg-[#063B2A] hover:bg-[#084b36] border-2 border-[#D4AF37] text-[#F5F0E6] text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
        >
          <RefreshCw className="w-4 h-4 text-[#D4AF37]" />
          PLAY TOURNAMENT AGAIN
        </button>

      </div>
    </div>
  );
};
