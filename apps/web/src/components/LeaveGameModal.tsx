import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface LeaveGameModalProps {
  isOpen: boolean;
  currentBet: number;
  onStay: () => void;
  onLeave: () => void;
}

export const LeaveGameModal: React.FC<LeaveGameModalProps> = ({
  isOpen,
  currentBet,
  onStay,
  onLeave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-[#090909] border border-amber-500/40 rounded-xl shadow-[0_10px_50px_rgba(0,0,0,0.95)] overflow-hidden text-center p-6 space-y-5">
        
        <div className="w-14 h-14 rounded-full bg-amber-950/40 border border-amber-500/50 flex items-center justify-center mx-auto text-amber-400">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div>
          <h2 className="font-cinzel text-2xl font-bold tracking-wider text-[#F5F0E6]">
            LEAVE GAME?
          </h2>
          <p className="text-sm text-gray-300 mt-2">
            You currently have an active bet placed on the table.
          </p>
        </div>

        {currentBet > 0 && (
          <div className="bg-[#04261D]/80 border border-[#063B2A] p-3.5 rounded-lg">
            <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">YOUR CURRENT BET IS</span>
            <div className="text-2xl font-bold font-mono text-[#D4AF37] mt-0.5">
              {currentBet.toLocaleString()} COINS
            </div>
            <p className="text-[11px] text-amber-400 mt-1 italic">
              Leaving now may forfeit your current hand & bet.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onStay}
            className="py-3 px-4 bg-[#063B2A] hover:bg-[#084b36] border border-[#D4AF37] text-[#F5F0E6] text-xs uppercase font-bold tracking-widest rounded shadow-md"
          >
            STAY & FINISH
          </button>
          <button
            onClick={onLeave}
            className="py-3 px-4 bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-300 text-xs uppercase font-bold tracking-widest rounded transition-colors"
          >
            LEAVE GAME
          </button>
        </div>

      </div>
    </div>
  );
};
