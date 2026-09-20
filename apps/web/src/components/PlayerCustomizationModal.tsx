import React, { useState } from 'react';
import { useTournament } from '../game/tournamentContext';
import { User, Shield, Check, X } from 'lucide-react';

interface PlayerCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerCustomizationModal: React.FC<PlayerCustomizationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { gameState, setPlayerIdentity } = useTournament();
  const [playerName, setPlayerName] = useState(gameState.playerName || 'BOOBA');
  const [teamName, setTeamName] = useState(gameState.teamName || 'HOUSE OF BOOBA');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPlayer = playerName.trim().replace(/[<>]/g, '');
    const cleanTeam = teamName.trim().replace(/[<>]/g, '');

    if (cleanPlayer.length < 2 || cleanPlayer.length > 16) {
      setError('Player name must be between 2 and 16 characters.');
      return;
    }
    if (cleanTeam.length < 2 || cleanTeam.length > 20) {
      setError('Team name must be between 2 and 20 characters.');
      return;
    }

    setPlayerIdentity(cleanPlayer, cleanTeam);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-[#090909] border border-[#063B2A] rounded-xl shadow-[0_10px_50px_rgba(0,0,0,0.9)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#04261D] border-b border-[#063B2A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#063B2A] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold tracking-wider text-[#F5F0E6]">
                PLAYER IDENTITY
              </h2>
              <p className="text-xs text-gray-400">Customize your player & tournament team name</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs uppercase font-bold text-[#D4AF37] tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              PLAYER NAME (2–16 CHARACTERS)
            </label>
            <input
              type="text"
              maxLength={16}
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="e.g. ARUN"
              className="w-full bg-[#04261D]/60 border border-[#063B2A] text-white px-4 py-2.5 rounded font-mono text-base focus:border-[#D4AF37] focus:outline-none tracking-wider"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-[#D4AF37] tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              TEAM NAME (2–20 CHARACTERS)
            </label>
            <input
              type="text"
              maxLength={20}
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="e.g. NIGHT OWLS"
              className="w-full bg-[#04261D]/60 border border-[#063B2A] text-white px-4 py-2.5 rounded font-mono text-base focus:border-[#D4AF37] focus:outline-none tracking-wider"
              required
            />
          </div>

          <div className="pt-3 border-t border-white/5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-900 border border-gray-700 text-gray-300 text-xs uppercase font-bold rounded hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#063B2A] hover:bg-[#084b36] border border-[#D4AF37] text-[#F5F0E6] text-xs uppercase font-bold tracking-widest rounded shadow-md flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-[#D4AF37]" />
              SAVE IDENTITY
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
