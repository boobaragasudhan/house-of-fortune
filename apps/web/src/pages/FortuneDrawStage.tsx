import React, { useState } from 'react';
import { useTournament } from '../game/tournamentContext';
import { Coins, Lock, Shield, Diamond, Skull, AlertTriangle, Sparkles, HandCoins } from 'lucide-react';
import type { FortuneSymbol } from '@hof/shared';

const SYMBOL_MAP: Record<FortuneSymbol, { icon: any, color: string }> = {
  FORTUNE: { icon: Sparkles, color: 'text-[#D4AF37]' },
  CROWN: { icon: Shield, color: 'text-purple-400' },
  GOLD: { icon: Coins, color: 'text-yellow-400' },
  SPADE: { icon: Diamond, color: 'text-gray-400' }, // using diamond as placeholder for generic
  DIAMOND: { icon: Diamond, color: 'text-cyan-400' },
  VAULT: { icon: Lock, color: 'text-emerald-400' },
  SHADOW: { icon: Skull, color: 'text-gray-600' },
  RISK: { icon: AlertTriangle, color: 'text-red-500' },
  WILD: { icon: Sparkles, color: 'text-pink-400' },
};

export const FortuneDrawStage: React.FC = () => {
  const { gameState, placeWager, revealTile, risk, bank } = useTournament();
  const [wagerAmount, setWagerAmount] = useState<number>(100);

  const WAGER_OPTIONS = [100, 250, 500, 1000, 2000];

  if (gameState.gameStatus === 'WAITING_FOR_WAGER') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#063B2A]/40 via-[#090909] to-[#090909] pointer-events-none" />
        
        <div className="z-10 bg-black/60 border border-[#D4AF37]/30 p-8 rounded-2xl backdrop-blur-md max-w-md w-full text-center shadow-2xl">
          <h2 className="font-cinzel text-3xl text-[#F5F0E6] mb-2">PLACE WAGER</h2>
          <p className="text-gray-400 text-sm font-mono mb-8">LEVEL {gameState.stage} • THE FORTUNE DRAW</p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {WAGER_OPTIONS.map(amt => (
              <button
                key={amt}
                onClick={() => setWagerAmount(amt)}
                className={`py-3 rounded border font-mono font-bold transition-all ${
                  wagerAmount === amt 
                    ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                    : 'border-white/10 bg-black text-gray-500 hover:border-white/30 hover:text-gray-300'
                }`}
              >
                {amt.toLocaleString()}
              </button>
            ))}
          </div>

          <button
            onClick={() => placeWager(wagerAmount)}
            disabled={gameState.isProcessing || gameState.playerCoins < wagerAmount}
            className="w-full py-4 bg-[#D4AF37] hover:bg-[#FCE69B] text-black font-bold uppercase tracking-widest rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {gameState.isProcessing ? 'AWAITING VRF...' : 'CONFIRM WAGER'}
          </button>
        </div>
      </div>
    );
  }

  const isRevealing = gameState.gameStatus === 'REVEALING';
  const isDecision = gameState.gameStatus === 'CASHOUT_DECISION';

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-4rem)] p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-[#090909] to-[#090909] pointer-events-none" />

      {/* Top Info */}
      <div className="z-10 flex w-full max-w-4xl justify-between items-center bg-black/40 border border-white/10 p-4 rounded-xl mb-6">
        <div>
          <span className="text-[10px] text-gray-500 uppercase font-mono block">Active Wager</span>
          <span className="text-lg font-bold text-white font-mono">{gameState.activeWager.toLocaleString()}</span>
        </div>
        <div className="text-center hidden md:block">
          <h2 className="font-cinzel text-xl text-[#D4AF37]">THE FORTUNE DRAW</h2>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-gray-500 uppercase font-mono block">Potential Reward</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">{gameState.currentPotentialReward.toLocaleString()}</span>
        </div>
      </div>

      {/* 3x3 Board */}
      <div className="z-10 grid grid-cols-3 gap-3 md:gap-4 max-w-[400px] w-full aspect-square mb-8">
        {gameState.board.map((tile, idx) => {
          const isRevealed = tile.status === 'REVEALED';
          const SymbolIcon = SYMBOL_MAP[tile.symbol]?.icon || Sparkles;
          const iconColor = SYMBOL_MAP[tile.symbol]?.color || 'text-white';

          return (
            <button
              key={idx}
              onClick={() => revealTile(idx)}
              disabled={!isRevealing || isRevealed}
              className={`relative flex items-center justify-center rounded-xl border-2 transition-all duration-500 ${
                isRevealed 
                  ? `border-white/20 bg-black/80 shadow-inner` 
                  : `border-[#D4AF37]/40 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-[#063B2A] hover:bg-[#084B36] hover:border-[#D4AF37] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] cursor-pointer`
              } ${(!isRevealing && !isRevealed) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRevealed ? (
                <div className="animate-in zoom-in spin-in-12 duration-500 flex flex-col items-center">
                  <SymbolIcon className={`w-10 h-10 md:w-14 md:h-14 ${iconColor}`} />
                  <span className="text-[10px] uppercase font-mono font-bold text-gray-400 mt-2">{tile.symbol}</span>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border border-[#D4AF37]/30 flex items-center justify-center opacity-50">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="z-10 w-full max-w-md bg-black/60 border border-white/10 p-6 rounded-2xl backdrop-blur-md flex flex-col gap-4">
        {isDecision ? (
          <>
            <div className="text-center mb-2">
              <h3 className="text-emerald-400 font-bold font-mono text-xl animate-pulse">COMBO FOUND!</h3>
              <p className="text-gray-400 text-xs mt-1">Bank now or risk for higher multiplier.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={bank}
                className="py-4 border border-emerald-500/50 bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-400 font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-all"
              >
                <HandCoins className="w-4 h-4" />
                BANK {gameState.currentPotentialReward.toLocaleString()}
              </button>
              <button
                onClick={risk}
                className="py-4 border border-red-500/50 bg-red-900/30 hover:bg-red-800/50 text-red-400 font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                RISK FOR MORE
              </button>
            </div>
          </>
        ) : isRevealing ? (
          <div className="text-center py-4">
            <p className="text-[#D4AF37] font-mono tracking-widest text-sm animate-pulse">REVEAL A TILE</p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 font-mono tracking-widest text-sm">ROUND COMPLETE</p>
          </div>
        )}
      </div>
    </div>
  );
};
