import React, { useState } from 'react';
import { useTournament } from '../game/tournamentContext';
import { Wallet, PlusCircle, RefreshCw, X, Shield, History, Coins } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

interface DemoWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoWalletModal: React.FC<DemoWalletModalProps> = ({ isOpen, onClose }) => {
  const { gameState, addDemoCoins, resetDemo } = useTournament();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleAdd = (amount: number) => {
    addDemoCoins(amount);
  };

  const handleResetConfirm = () => {
    resetDemo();
    setShowResetConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#090909] border border-[#063B2A] rounded-xl shadow-[0_10px_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#04261D] border-b border-[#063B2A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#063B2A] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-xl font-bold tracking-wider text-[#F5F0E6] flex items-center gap-2">
                DEMO WALLET
                <span className="text-[10px] uppercase font-sans font-semibold bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                  VIRTUAL CREDITS ONLY
                </span>
              </h2>
              <p className="text-xs text-gray-400">Manage virtual tournament funds and view transaction history</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Main Balances Display Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#04261D]/60 border border-[#063B2A] p-4 rounded-lg flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">AVAILABLE</span>
              <div className="text-2xl font-bold font-mono text-[#D4AF37] mt-1">
                <AnimatedCounter value={gameState.playerCoins} />
              </div>
              <span className="text-[10px] text-gray-500 uppercase mt-1">Demo Coins</span>
            </div>

            <div className="bg-[#04261D]/60 border border-[#063B2A] p-4 rounded-lg flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">SECURED</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 flex items-center gap-1">
                <Shield className="w-4 h-4 text-emerald-500 inline" />
                <AnimatedCounter value={gameState.securedReward} />
              </div>
              <span className="text-[10px] text-gray-500 uppercase mt-1">Protected</span>
            </div>

            <div className="bg-[#04261D]/60 border border-[#063B2A] p-4 rounded-lg flex flex-col justify-between">
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1 block">Active Wager</span>
              <span className="text-[#D4AF37] font-mono font-bold text-lg">
                <AnimatedCounter value={gameState.activeWager} />
              </span>
              <span className="text-[10px] text-gray-500 uppercase mt-1">In Play</span>
            </div>

            <div className="bg-[#04261D]/60 border border-[#063B2A] p-4 rounded-lg flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">TOTAL REWARD</span>
              <div className="text-2xl font-bold font-mono text-[#F5F0E6] mt-1">
                <AnimatedCounter value={gameState.totalTournamentReward} />
              </div>
              <span className="text-[10px] text-gray-500 uppercase mt-1">Tournament</span>
            </div>
          </div>

          {/* Add Demo Funds Section */}
          <div className="bg-black/40 border border-white/5 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F0E6]">
                <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
                <span>ADD DEMO FUNDS</span>
              </div>
              <span className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wider bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                DEMO CREDITS ONLY
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[1000, 5000, 10000, 50000].map(amt => (
                <button
                  key={amt}
                  onClick={() => handleAdd(amt)}
                  className="py-2.5 px-3 bg-[#063B2A] hover:bg-[#084b36] border border-[#D4AF37]/40 text-[#F5F0E6] font-mono text-sm font-bold rounded shadow transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1"
                >
                  <Coins className="w-3.5 h-3.5 text-[#D4AF37]" />
                  +{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction History Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F0E6]">
              <History className="w-4 h-4 text-[#D4AF37]" />
              <span>TRANSACTION HISTORY</span>
            </div>

            <div className="bg-black/50 border border-white/5 rounded-lg overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
              {gameState.transactions.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500 italic">
                  No transactions recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {gameState.transactions.slice(0, 15).map(tx => (
                    <div key={tx.id} className="p-3 flex items-center justify-between text-xs hover:bg-white/[0.02]">
                      <div className="flex items-center gap-3">
                        <span className={`font-mono font-bold text-sm ${
                          tx.amount > 0 ? 'text-emerald-400' : tx.amount < 0 ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-200">{tx.label}</p>
                          <p className="text-[10px] text-gray-500 uppercase">{tx.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">{tx.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reset Demo Section */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            {showResetConfirm ? (
              <div className="w-full bg-red-950/40 border border-red-800/50 p-3 rounded-lg flex items-center justify-between animate-fade-in">
                <span className="text-xs text-red-200 font-medium">Reset wallet to 10,000 coins & reset tournament?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetConfirm}
                    className="px-3 py-1 bg-red-700 text-white text-xs font-bold rounded hover:bg-red-600"
                  >
                    Reset Demo
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-950/20 border border-red-900/40 text-red-400 hover:bg-red-900/40 text-xs uppercase font-bold rounded transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                RESET DEMO
              </button>
            )}

            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#063B2A] hover:bg-[#084b36] border border-[#D4AF37]/50 text-[#F5F0E6] text-xs uppercase font-bold tracking-wider rounded"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
