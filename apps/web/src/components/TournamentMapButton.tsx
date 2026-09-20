import React from 'react';
import { useTournament } from '../game/tournamentContext';
import { CheckCircle2, Lock } from 'lucide-react';

export const TournamentMapButton: React.FC = () => {
  const { gameState, setPhase } = useTournament();
  
  if (gameState.phase === 'HOME' || gameState.phase === 'LOBBY' || gameState.phase === 'FINAL_STATS') {
    return null;
  }

  const handleReturnToMap = () => {
    // Only allow if no active game (i.e. WAITING_FOR_WAGER or finished round)
    // Actually the user can use the back button for LEAVE GAME confirmation, 
    // but this map button can just be a visual indicator or a quick jump back to lobby.
    if (gameState.gameStatus === 'WAITING_FOR_WAGER' || gameState.gameStatus === 'ROUND_WIN' || gameState.gameStatus === 'ROUND_LOSS') {
      setPhase('LOBBY');
    }
  };

  return (
    <button 
      onClick={handleReturnToMap}
      title="View Tournament Map"
      className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border border-white/10 rounded-full hover:bg-white/5 transition-colors group cursor-pointer"
    >
      <span className="text-[9px] uppercase font-mono text-gray-500 mr-1 hidden lg:block group-hover:text-gray-300">
        Tournament Map
      </span>
      {Array.from({ length: 5 }).map((_, index) => {
        const level = index + 1;
        const isCompleted = level < gameState.stage;
        const isCurrent = level === gameState.stage;
        const isLocked = level > gameState.stage;

        return (
          <div 
            key={level} 
            className={`flex items-center justify-center transition-all ${
              isCurrent 
                ? 'w-5 h-5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.8)] scale-110 z-10' 
                : isCompleted 
                  ? 'w-4 h-4 rounded-full bg-emerald-600' 
                  : 'w-4 h-4 rounded-full bg-gray-800'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-2.5 h-2.5 text-white" />
            ) : isLocked ? (
              <Lock className="w-2 h-2 text-gray-500" />
            ) : (
              <span className="text-[10px] font-bold text-black font-mono">{level}</span>
            )}
          </div>
        );
      })}
    </button>
  );
};
