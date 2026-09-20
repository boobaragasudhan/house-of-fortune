import React from 'react';
import { useTournament } from '../game/tournamentContext';
import { Lock, CheckCircle2, Play, Sparkles, Flame, ShieldAlert, Dices, Trophy } from 'lucide-react';

const TOURNAMENT_LEVELS = [
  { id: 1, name: 'THE OFFER', game: 'FORTUNE DRAW', players: 8, reward: 1500, icon: Sparkles },
  { id: 2, name: 'THE RISK', game: 'FORTUNE DRAW', players: 6, reward: 3000, icon: Flame },
  { id: 3, name: 'THE VAULT', game: 'FORTUNE DRAW', players: 5, reward: 6000, icon: ShieldAlert },
  { id: 4, name: 'THE FORTUNE', game: 'FORTUNE DRAW', players: 3, reward: 12000, icon: Dices },
  { id: 5, name: 'THE CHAMPIONSHIP', game: 'FORTUNE DRAW', players: 2, reward: 25000, icon: Trophy },
];

export const Lobby: React.FC = () => {
  const { gameState, enterCurrentLevel } = useTournament();
  const currentStage = gameState.stage;

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-4rem)] p-4 max-w-4xl mx-auto space-y-8 py-10 relative overflow-hidden">
      
      {/* Cinematic background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#063B2A] rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4AF37] rounded-full mix-blend-screen filter blur-[120px] opacity-10"></div>
      </div>

      {/* Header */}
      <div className="text-center z-10">
        <h2 className="font-cinzel text-5xl font-extrabold text-[#F5F0E6] tracking-wider mb-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          THE TOURNAMENT
        </h2>
        <p className="text-sm text-gray-400 max-w-lg mx-auto uppercase tracking-widest font-mono">
          5 Levels. 8 Players. 1 Champion.
        </p>
      </div>

      {/* Vertical Map */}
      <div className="relative w-full max-w-2xl mt-12 z-10 pb-20">
        {/* Connecting Line */}
        <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-[#D4AF37] via-[#063B2A] to-black/50 hidden md:block"></div>

        <div className="space-y-6">
          {TOURNAMENT_LEVELS.map((level) => {
            const isCompleted = level.id < currentStage;
            const isCurrent = level.id === currentStage;
            const isLocked = level.id > currentStage;
            const Icon = level.icon;

            return (
              <div 
                key={level.id} 
                className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 p-6 rounded-2xl border-2 transition-all duration-500 shadow-2xl ${
                  isCurrent 
                    ? 'border-[#D4AF37]/80 bg-[#063B2A]/40 scale-[1.02] ring-4 ring-[#D4AF37]/20 shadow-[0_0_40px_rgba(212,175,55,0.15)]' 
                    : isCompleted 
                      ? 'border-emerald-900/50 bg-black/60 opacity-80' 
                      : 'border-white/5 bg-black/40 opacity-50 grayscale hover:grayscale-0 transition-all'
                }`}
              >
                {/* Node Status Indicator (Left) */}
                <div className={`hidden md:flex absolute -left-[1.35rem] w-10 h-10 rounded-full border-4 border-[#090909] items-center justify-center z-10 transition-colors ${
                  isCurrent ? 'bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.5)]' : isCompleted ? 'bg-emerald-600' : 'bg-gray-800'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4 text-gray-400" />
                  ) : (
                    <span className="text-[#090909] font-bold font-mono text-sm">{level.id}</span>
                  )}
                </div>

                {/* Mobile Status Indicator (Top) */}
                <div className="md:hidden flex items-center gap-3 mb-2 w-full">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCurrent ? 'bg-[#D4AF37] text-black' : isCompleted ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : isLocked ? <Lock className="w-4 h-4" /> : <span className="font-bold text-sm">{level.id}</span>}
                  </div>
                  <span className="text-xs font-mono font-bold tracking-widest text-[#D4AF37]">
                    LEVEL {level.id}
                  </span>
                </div>

                {/* Level Content */}
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className={`font-cinzel text-2xl font-bold tracking-wider ${isCurrent ? 'text-[#F5F0E6]' : 'text-gray-300'}`}>
                        {level.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#D4AF37]' : 'text-gray-500'}`} />
                        <span className={`text-xs font-mono tracking-widest ${isCurrent ? 'text-[#D4AF37]' : 'text-gray-500'}`}>
                          {level.game}
                        </span>
                      </div>
                    </div>
                    
                    {/* Reward Badge */}
                    <div className="text-right">
                      <span className="block text-[10px] uppercase text-gray-500 font-mono tracking-wider">Reward</span>
                      <span className={`font-mono font-bold ${isCurrent ? 'text-emerald-400 text-lg' : 'text-gray-400 text-md'}`}>
                        {level.reward.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Player Count Bar */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {Array.from({ length: Math.min(level.players, 5) }).map((_, i) => (
                        <div key={i} className={`w-6 h-6 rounded-full border-2 border-black ${
                          isCurrent ? 'bg-gray-400' : isCompleted ? 'bg-emerald-800' : 'bg-gray-800'
                        }`} />
                      ))}
                      {level.players > 5 && (
                        <div className="w-6 h-6 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-[8px] text-gray-400 font-bold">
                          +{level.players - 5}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-mono text-gray-500">
                      {level.players} PLAYERS
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="w-full md:w-auto mt-4 md:mt-0 flex-shrink-0">
                  {isCurrent ? (
                    <button
                      onClick={enterCurrentLevel}
                      className="w-full md:w-auto px-8 py-4 bg-[#D4AF37] hover:bg-[#FCE69B] text-black text-sm font-bold uppercase tracking-widest rounded shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-105"
                    >
                      <Play className="w-4 h-4" />
                      ENTER LEVEL
                    </button>
                  ) : isCompleted ? (
                    <div className="px-6 py-3 border border-emerald-900/50 text-emerald-500/50 text-xs font-bold uppercase tracking-widest rounded bg-emerald-950/20 text-center">
                      COMPLETED
                    </div>
                  ) : (
                    <div className="px-6 py-3 border border-white/10 text-gray-600 text-xs font-bold uppercase tracking-widest rounded bg-black/40 flex items-center justify-center gap-2">
                      <Lock className="w-3 h-3" />
                      LOCKED
                    </div>
                  )}
                </div>
                
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
