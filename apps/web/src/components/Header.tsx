import React, { useState } from 'react';
import { useTournament } from '../game/tournamentContext';
import { Volume2, VolumeX, Film, ArrowLeft, Wallet, User, Lock } from 'lucide-react';
import { DemoWalletModal } from './DemoWalletModal';
import { PlayerCustomizationModal } from './PlayerCustomizationModal';
import { LeaveGameModal } from './LeaveGameModal';
import { AnimatedCounter } from './AnimatedCounter';
import { TournamentMapButton } from './TournamentMapButton';

interface HeaderProps {
  onReplayIntro?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReplayIntro }) => {
  const { gameState, toggleSound, setVolume, setPhase } = useTournament();

  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  const isGamePhase = gameState.phase === 'FORTUNE_DRAW';
  const isLobbyOrGame = ['LOBBY', 'FORTUNE_DRAW', 'FINAL_STATS'].includes(gameState.phase);

  const handleBackClick = () => {
    if (isGamePhase && gameState.activeWager > 0 && (gameState.gameStatus === 'WAITING_VRF' || gameState.gameStatus === 'REVEALING' || gameState.gameStatus === 'CASHOUT_DECISION')) {
      setIsLeaveModalOpen(true);
    } else if (isGamePhase) {
      setPhase('LOBBY');
    } else if (gameState.phase === 'LOBBY') {
      setPhase('HOME');
    }
  };

  const handleConfirmLeave = () => {
    setIsLeaveModalOpen(false);
    setPhase('LOBBY');
  };

  return (
    <>
      <header className="fixed top-0 w-full h-16 bg-[#090909]/95 backdrop-blur-md border-b border-[#063B2A] z-50 flex items-center px-4 md:px-6 justify-between shadow-[0_4px_25px_rgba(0,0,0,0.85)]">
        
        {/* Left Section: Back Button & Compact HUD */}
        <div className="flex items-center gap-3 md:gap-5">
          {isLobbyOrGame && (
            <button
              onClick={handleBackClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#04261D] border border-[#063B2A] text-xs font-bold text-[#F5F0E6] hover:bg-[#063B2A] hover:border-[#D4AF37]/50 transition-all shadow"
            >
              <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
              <span className="hidden sm:inline">
                {isGamePhase ? '← LOBBY' : '← HOME'}
              </span>
            </button>
          )}

          <div className="flex items-center gap-3">
            <h1 className="font-cinzel text-lg md:text-xl font-bold tracking-widest text-[#F5F0E6] flex items-center gap-1">
              HOUSE<span className="text-[#D4AF37]">OF</span>FORTUNE
            </h1>

            {isLobbyOrGame && (
              <span className="hidden lg:inline bg-[#063B2A] text-white text-[11px] font-mono font-bold px-2.5 py-0.5 rounded border border-[#04261D]">
                ROUND {gameState.stage} / 5
              </span>
            )}
          </div>
        </div>

        {/* Center Compact Tournament HUD — Player & Secured */}
        {isLobbyOrGame && (
          <div className="hidden md:flex items-center gap-4 bg-[#04261D]/80 border border-[#063B2A] px-4 py-1.5 rounded-lg shadow-inner">
            <button
              onClick={() => setIsCustomizationOpen(true)}
              className="flex items-center gap-2 text-xs hover:text-[#D4AF37] transition-colors"
              title="Edit Player Name & Team"
            >
              <User className="w-3.5 h-3.5 text-[#D4AF37]" />
              <div className="text-left leading-tight">
                <span className="font-bold text-[#F5F0E6] block uppercase">{gameState.playerName}</span>
                <span className="text-[9px] text-gray-400 font-mono block">{gameState.teamName}</span>
              </div>
            </button>

            <div className="h-6 w-px bg-white/10" />

            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <div className="text-left leading-tight">
                <span className="text-[9px] uppercase font-bold text-gray-400 block">SECURED</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  <AnimatedCounter value={gameState.securedReward} />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Right Section: Virtual Wallet & Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          
          {isLobbyOrGame && <TournamentMapButton />}

          {/* Virtual Demo Wallet Button */}
          <button
            onClick={() => setIsWalletOpen(true)}
            className="flex items-center gap-2 bg-[#04261D] hover:bg-[#063B2A] border border-[#D4AF37]/40 hover:border-[#D4AF37] px-3 py-1.5 rounded-lg transition-all shadow"
          >
            <Wallet className="w-4 h-4 text-[#D4AF37]" />
            <div className="text-left leading-none">
              <span className="text-[9px] uppercase font-bold text-gray-400 block">WALLET</span>
              <span className="font-mono font-bold text-[#D4AF37] text-xs sm:text-sm">
                <AnimatedCounter value={gameState.playerCoins} />
              </span>
            </div>
          </button>

          {/* Replay Intro */}
          {onReplayIntro && (
            <button 
              onClick={onReplayIntro}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs uppercase font-bold text-[#D4AF37] border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
              title="Replay Cinematic Intro"
            >
              <Film className="w-3.5 h-3.5" />
              Intro
            </button>
          )}

          {/* Audio Controls */}
          <div className="flex items-center gap-2 border-l border-gray-800 pl-3">
            <button 
              onClick={toggleSound}
              className="text-gray-400 hover:text-white p-1 transition-colors"
            >
              {gameState.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            
            {gameState.soundEnabled && (
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={gameState.volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-14 accent-[#D4AF37] hidden md:inline"
              />
            )}
          </div>
        </div>

      </header>

      {/* Modals */}
      <DemoWalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
      <PlayerCustomizationModal isOpen={isCustomizationOpen} onClose={() => setIsCustomizationOpen(false)} />
      <LeaveGameModal
        isOpen={isLeaveModalOpen}
        currentBet={gameState.activeWager}
        onStay={() => setIsLeaveModalOpen(false)}
        onLeave={handleConfirmLeave}
      />
    </>
  );
};
