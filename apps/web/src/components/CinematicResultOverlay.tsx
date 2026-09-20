import React, { useEffect, useState } from 'react';
import type { ResultOverlayData } from '@hof/shared';
import { Trophy, Shield, ArrowRight, RotateCcw, Lock, Star } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { HoFEmblem } from './HoFEmblem';
import { cinematicAudio } from '../game/cinematicAudio';

interface CinematicResultOverlayProps {
  data: ResultOverlayData;
  onContinue: () => void;
  onCashOut?: () => void;
  onPlayAgain?: () => void;
  onSkip?: () => void;
}

export const CinematicResultOverlay: React.FC<CinematicResultOverlayProps> = ({
  data,
  onContinue,
  onCashOut,
  onPlayAgain,
  onSkip,
}) => {
  const [championPhase, setChampionPhase] = useState<'BLACK' | 'LIGHTS' | 'EMBLEM' | 'FULL'>('BLACK');

  useEffect(() => {
    if (!data) return;

    if (data.type === 'CHAMPION') {
      cinematicAudio.playVictoryChord();
      setChampionPhase('BLACK');

      const t1 = setTimeout(() => setChampionPhase('LIGHTS'), 500);
      const t2 = setTimeout(() => setChampionPhase('EMBLEM'), 1500);
      const t3 = setTimeout(() => setChampionPhase('FULL'), 2500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else if (data.type === 'WIN' || data.type === 'ROUND_WIN') {
      cinematicAudio.playVictoryChord();
    } else if (data.type === 'LOSS' || data.type === 'ROUND_LOSS') {
      cinematicAudio.playLossSound();
    }
  }, [data]);

  if (!data) return null;

  const isWin = data.type === 'WIN' || data.type === 'ROUND_WIN' || data.type === 'CHAMPION';
  const isChampion = data.type === 'CHAMPION';

  // Champion Special Sequence Render
  if (isChampion) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black overflow-hidden animate-fade-in">
        
        {/* Volumetric background lights */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${
          championPhase !== 'BLACK' ? 'opacity-100' : 'opacity-0'
        } bg-[radial-gradient(ellipse_at_50%_40%,rgba(212,175,55,0.18)_0%,rgba(6,59,42,0.1)_40%,#000_75%)]`} />

        {/* Ambient gold particles */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle,#D4AF37_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Skip button */}
        {onSkip && (
          <button
            onClick={onSkip}
            className="absolute top-6 right-6 z-[130] text-xs font-mono text-[#D4AF37]/60 hover:text-[#D4AF37] px-3 py-1.5 border border-[#D4AF37]/20 rounded"
          >
            SKIP →
          </button>
        )}

        <div className="relative z-[125] text-center max-w-xl mx-auto px-6 py-12 flex flex-col items-center">
          
          {/* Emblem */}
          <div className={`transition-all duration-1000 transform ${
            championPhase === 'EMBLEM' || championPhase === 'FULL'
              ? 'opacity-100 scale-100 rotate-0'
              : 'opacity-0 scale-75 -rotate-12'
          }`}>
            <HoFEmblem size={120} glowIntensity={0.8} />
          </div>

          {/* Title & Player Name */}
          <div className={`transition-all duration-1000 delay-300 transform ${
            championPhase === 'FULL' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}>
            <div className="flex items-center justify-center gap-2 mt-6 text-[#D4AF37] tracking-[0.4em] text-sm font-semibold uppercase">
              <Star className="w-4 h-4 fill-[#D4AF37]" />
              <span>TOURNAMENT CHAMPION</span>
              <Star className="w-4 h-4 fill-[#D4AF37]" />
            </div>

            <h1 className="font-cinzel text-5xl md:text-7xl font-black tracking-widest text-[#F5F0E6] drop-shadow-[0_4px_25px_rgba(212,175,55,0.4)] mt-2">
              {data.playerName || 'BOOBA'}
            </h1>

            <p className="text-emerald-400 font-cinzel text-xl tracking-wider mt-1 uppercase font-semibold">
              {data.teamName || 'HOUSE OF BOOBA'}
            </p>

            {/* Total Reward */}
            <div className="mt-8 bg-[#04261D]/90 border border-[#D4AF37]/60 px-8 py-5 rounded-xl shadow-[0_0_40px_rgba(212,175,55,0.2)]">
              <span className="text-xs uppercase font-bold text-gray-300 tracking-widest">FINAL GRAND CHAMPION PRIZE</span>
              <div className="text-4xl md:text-5xl font-extrabold font-mono text-[#D4AF37] mt-1 drop-shadow-md">
                <AnimatedCounter value={data.reward} prefix="+" suffix=" COINS" />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              {onPlayAgain && (
                <button
                  onClick={onPlayAgain}
                  className="px-8 py-4 bg-[#063B2A] hover:bg-[#084b36] border-2 border-[#D4AF37] text-[#F5F0E6] text-sm uppercase font-bold tracking-widest rounded-lg shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all hover:scale-105 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-[#D4AF37]" />
                  PLAY AGAIN
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    );
  }

  // Standard Win / Loss / Round Win Overlay
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-lg p-4 animate-fade-in">
      
      {/* Background Volumetric Glow */}
      <div className={`absolute inset-0 pointer-events-none opacity-30 ${
        isWin
          ? 'bg-[radial-gradient(ellipse_at_50%_50%,rgba(212,175,55,0.3)_0%,rgba(6,59,42,0.15)_40%,transparent_70%)]'
          : 'bg-[radial-gradient(ellipse_at_50%_50%,rgba(139,30,30,0.3)_0%,rgba(20,0,0,0.15)_40%,transparent_70%)]'
      }`} />

      {/* Skip Button */}
      {onSkip && (
        <button
          onClick={onSkip}
          className="absolute top-6 right-6 z-[130] text-xs font-mono text-gray-400 hover:text-white px-3 py-1.5 border border-white/10 rounded"
        >
          SKIP →
        </button>
      )}

      <div className="relative z-[125] w-full max-w-lg bg-[#090909] border border-[#063B2A] rounded-2xl shadow-[0_15px_60px_rgba(0,0,0,0.95)] overflow-hidden text-center p-8 space-y-6">
        
        {/* Emblem / Trophy Icon */}
        <div className="mx-auto flex justify-center">
          {isWin ? (
            <div className="w-16 h-16 rounded-full bg-[#063B2A] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.4)]">
              <Trophy className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-red-950/60 border-2 border-red-700 flex items-center justify-center text-red-400 shadow-[0_0_25px_rgba(139,30,30,0.4)]">
              <Shield className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Title & Subtitle */}
        <div>
          <span className={`text-xs uppercase font-bold tracking-[0.3em] ${isWin ? 'text-[#D4AF37]' : 'text-red-400'}`}>
            {data.subtitle || `ROUND ${data.round} OF 5`}
          </span>
          <h2 className="font-cinzel text-3xl md:text-4xl font-extrabold tracking-wider text-[#F5F0E6] mt-1">
            {data.title}
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-mono">
            {data.playerName} • {data.teamName}
          </p>
        </div>

        {/* Reward / Loss Box */}
        <div className="bg-[#04261D]/80 border border-[#063B2A] p-5 rounded-xl">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
            {isWin ? 'ROUND REWARD' : 'HAND RESULT'}
          </span>
          <div className={`text-3xl md:text-4xl font-extrabold font-mono mt-1 ${
            isWin ? 'text-[#D4AF37]' : 'text-red-400'
          }`}>
            <AnimatedCounter value={data.reward} prefix={isWin ? '+' : ''} suffix=" COINS" />
          </div>

          {/* Secured Lock Indicator */}
          {data.secured > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>SECURED TOURNAMENT REWARD: </span>
              <span className="font-mono font-bold text-sm text-[#F5F0E6]">{data.secured.toLocaleString()} COINS</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {onCashOut && isWin && (
            <button
              onClick={onCashOut}
              className="py-3 px-4 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/60 text-amber-300 text-xs uppercase font-bold tracking-widest rounded-lg transition-all"
            >
              CASH OUT ({data.secured.toLocaleString()})
            </button>
          )}

          {onContinue && (
            <button
              onClick={onContinue}
              className={`py-3.5 px-6 bg-[#063B2A] hover:bg-[#084b36] border border-[#D4AF37] text-[#F5F0E6] text-xs uppercase font-bold tracking-widest rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                !onCashOut ? 'col-span-full' : ''
              }`}
            >
              <span>CONTINUE</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
            </button>
          )}

          {onPlayAgain && !onContinue && (
            <button
              onClick={onPlayAgain}
              className="col-span-full py-3.5 px-6 bg-[#063B2A] hover:bg-[#084b36] border border-[#D4AF37] text-[#F5F0E6] text-xs uppercase font-bold tracking-widest rounded-lg shadow-lg flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-[#D4AF37]" />
              PLAY AGAIN
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
