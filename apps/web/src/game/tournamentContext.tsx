import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  GameState, GamePhase, GameStage, GameStatus, Transaction, ResultOverlayData, FortuneTile
} from '@hof/shared';
import { soundManager } from './soundManager';
import { cinematicAudio } from './cinematicAudio';
import { ChainVRF } from '../chain/vrf';
import { PAYTABLE } from './gameConfig';

interface TournamentContextType {
  gameState: GameState;
  
  // Game Flow
  startTournament: () => void;
  enterCurrentLevel: () => void;
  setPhase: (phase: GamePhase) => void;
  cashOut: () => void;

  // Customization & Wallet
  setPlayerIdentity: (playerName: string, teamName: string) => void;
  addDemoCoins: (amount: number) => void;
  resetDemo: () => void;

  // Fortune Draw Actions
  placeWager: (amount: number) => Promise<void>;
  revealTile: (index: number) => void;
  risk: () => void;
  bank: () => void;

  // Overlays
  showResultOverlay: (data: NonNullable<ResultOverlayData>) => void;
  closeResultOverlay: () => void;

  // Settings
  toggleDemoMode: () => void;
  toggleSound: () => void;
  setVolume: (v: number) => void;
}

const defaultState: GameState = {
  phase: 'HOME',
  stage: 1,
  gameStatus: 'WAITING_FOR_WAGER',
  
  playerName: 'PLAYER',
  teamName: 'CHAIN JAM',
  
  competitors: Array.from({ length: 8 }, (_, i) => ({
    id: `comp_${i}`, name: `Player ${i+1}`, isPlayer: i === 0, score: 0, eliminated: false, rank: null
  })),
  
  playerCoins: 10000,
  securedReward: 0,
  activeWager: 0,
  currentPotentialReward: 0,
  totalTournamentReward: 0,
  transactions: [],
  
  board: [],
  
  lastStageResult: null,
  resultOverlay: null,
  
  isProcessing: false,
  soundEnabled: true,
  volume: 0.5,
  demoMode: false,
  cashedOut: false,
};

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(defaultState);

  useEffect(() => {
    soundManager.enabled = gameState.soundEnabled;
    soundManager.volume = gameState.volume;
    cinematicAudio.setMasterVolume(gameState.volume);
  }, [gameState.soundEnabled, gameState.volume]);

  const addTransaction = (amount: number, type: Transaction['type'], label: string) => {
    setGameState(prev => ({
      ...prev,
      transactions: [{
        id: Math.random().toString(36).substring(2, 9),
        amount, type, label,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }, ...prev.transactions],
    }));
  };

  const setPlayerIdentity = (playerName: string, teamName: string) => {
    setGameState(prev => ({
      ...prev, playerName, teamName,
      competitors: prev.competitors.map(c => c.isPlayer ? { ...c, name: `${playerName} (${teamName})` } : c),
    }));
  };

  const addDemoCoins = (amount: number) => {
    soundManager.play('chipPlace');
    setGameState(prev => ({ ...prev, playerCoins: prev.playerCoins + amount }));
    addTransaction(amount, 'DEMO_ADD', `Added +${amount.toLocaleString()} Demo Credits`);
  };

  const resetDemo = () => {
    soundManager.play('click');
    setGameState(prev => ({
      ...defaultState,
      playerName: prev.playerName, teamName: prev.teamName,
      soundEnabled: prev.soundEnabled, volume: prev.volume, demoMode: prev.demoMode,
    }));
  };

  const startTournament = () => {
    setGameState(prev => ({
      ...defaultState,
      phase: 'LOBBY', stage: 1,
      playerName: prev.playerName, teamName: prev.teamName,
      competitors: prev.competitors.map(c => ({ ...c, score: 0, eliminated: false })),
      playerCoins: prev.playerCoins, transactions: prev.transactions
    }));
  };

  const enterCurrentLevel = () => {
    soundManager.play('click');
    cinematicAudio.playTransition();
    setGameState(prev => ({
      ...prev, phase: 'FORTUNE_DRAW', gameStatus: 'WAITING_FOR_WAGER', activeWager: 0, currentPotentialReward: 0, board: []
    }));
  };

  const calculatePotential = (board: FortuneTile[], wager: number): number => {
    const revealed = board.filter(t => t.status === 'REVEALED');
    if (revealed.length === 0) return 0;
    
    const counts: Record<string, number> = {};
    let wilds = 0;
    revealed.forEach(t => {
      if (t.symbol === 'WILD') wilds++;
      else counts[t.symbol] = (counts[t.symbol] || 0) + 1;
    });

    let maxMultiplier = 0;

    // Evaluate Golds
    const golds = (counts['GOLD'] || 0) + wilds;
    if (golds >= 5) maxMultiplier = Math.max(maxMultiplier, PAYTABLE.GOLD_5);
    else if (golds === 4) maxMultiplier = Math.max(maxMultiplier, PAYTABLE.GOLD_4);
    else if (golds === 3) maxMultiplier = Math.max(maxMultiplier, PAYTABLE.GOLD_3);

    // Evaluate Fortune/Crown
    const fortunes = (counts['FORTUNE'] || 0) + wilds;
    const crowns = (counts['CROWN'] || 0) + wilds;

    if (fortunes >= 1 && crowns >= 1) maxMultiplier = Math.max(maxMultiplier, PAYTABLE.FORTUNE_CROWN);
    else if (fortunes >= 2) maxMultiplier = Math.max(maxMultiplier, PAYTABLE.FORTUNE_COMBO);
    else if (crowns >= 2) maxMultiplier = Math.max(maxMultiplier, PAYTABLE.CROWN_COMBO);

    // Jackpot
    if (revealed.length === 9) maxMultiplier = PAYTABLE.FULL_BOARD;

    return wager * maxMultiplier;
  };

  const placeWager = async (amount: number) => {
    if (gameState.playerCoins < amount) return;
    
    soundManager.play('chipPlace');
    addTransaction(-amount, 'WAGER', `Wager placed in Level ${gameState.stage}`);
    
    setGameState(prev => ({
      ...prev,
      playerCoins: prev.playerCoins - amount,
      activeWager: amount,
      gameStatus: 'WAITING_VRF',
      isProcessing: true
    }));

    // VRF Flow
    const reqId = await ChainVRF.requestRandomness(amount);
    const board = await ChainVRF.determineOutcome(reqId);

    setGameState(prev => ({
      ...prev,
      board,
      gameStatus: 'REVEALING',
      isProcessing: false
    }));
  };

  const revealTile = (index: number) => {
    setGameState(prev => {
      if (prev.gameStatus !== 'REVEALING') return prev;
      if (prev.board[index].status !== 'HIDDEN') return prev;

      cinematicAudio.playCardFlip();

      const newBoard = [...prev.board];
      newBoard[index] = { ...newBoard[index], status: 'REVEALED' };

      const revealedCount = newBoard.filter(t => t.status === 'REVEALED').length;
      
      // Calculate new potential
      const newPotential = calculatePotential(newBoard, prev.activeWager);
      
      // Logic: 
      // After first 3 reveals, if they have a combo, they can bank.
      // If they are RISK-ing (i.e. revealed > 3), they MUST improve their potential, otherwise they bust.
      
      let nextStatus: GameStatus = prev.gameStatus;
      let finalOverlay = prev.resultOverlay;

      if (revealedCount === 3) {
        if (newPotential > 0) nextStatus = 'CASHOUT_DECISION';
        else {
          nextStatus = 'ROUND_LOSS';
          soundManager.play('loss');
        }
      } else if (revealedCount > 3) {
        if (newPotential > prev.currentPotentialReward) {
          nextStatus = 'CASHOUT_DECISION'; // Survived the risk
        } else {
          nextStatus = 'ROUND_LOSS'; // Busted
          soundManager.play('loss');
        }
      }

      if (nextStatus === 'ROUND_LOSS') {
        finalOverlay = {
          type: 'ROUND_LOSS', title: 'THE FORTUNE TURNED', subtitle: 'WAGER LOST',
          reward: 0, secured: prev.securedReward, bet: prev.activeWager,
          round: prev.stage, playerName: prev.playerName, teamName: prev.teamName
        };
      } else if (revealedCount === 9) {
        // Full board jackpot
        nextStatus = 'ROUND_WIN';
        soundManager.play('win');
        finalOverlay = {
          type: 'ROUND_WIN', title: 'JACKPOT', subtitle: 'FULL BOARD REVEALED',
          reward: newPotential, secured: prev.securedReward + newPotential, bet: prev.activeWager,
          round: prev.stage, playerName: prev.playerName, teamName: prev.teamName
        };
      }

      return {
        ...prev,
        board: newBoard,
        currentPotentialReward: newPotential,
        gameStatus: nextStatus,
        resultOverlay: finalOverlay
      };
    });
  };

  const risk = () => {
    soundManager.play('click');
    setGameState(prev => ({ ...prev, gameStatus: 'REVEALING' }));
  };

  const bank = () => {
    soundManager.play('cashOut');
    setGameState(prev => {
      const newSecured = prev.securedReward + prev.currentPotentialReward;
      const tournamentReward = [0, 1500, 3000, 6000, 12000, 25000][prev.stage];
      const totalReward = prev.currentPotentialReward + tournamentReward;
      
      addTransaction(totalReward, 'GAME_REWARD', `Banked Reward Level ${prev.stage}`);

      return {
        ...prev,
        gameStatus: 'ROUND_WIN',
        playerCoins: prev.playerCoins + totalReward,
        securedReward: newSecured,
        resultOverlay: {
          type: 'ROUND_WIN', title: 'LEVEL COMPLETE', subtitle: `BANKED ${prev.currentPotentialReward}`,
          reward: totalReward, secured: newSecured, bet: prev.activeWager,
          round: prev.stage, playerName: prev.playerName, teamName: prev.teamName
        }
      };
    });
  };

  const showResultOverlay = (data: NonNullable<ResultOverlayData>) => setGameState(prev => ({ ...prev, resultOverlay: data }));
  const closeResultOverlay = () => setGameState(prev => {
    // If they won and clicked continue, we advance stage.
    if (prev.gameStatus === 'ROUND_WIN' && prev.stage < 5) {
      return { ...prev, resultOverlay: null, phase: 'LOBBY', stage: (prev.stage + 1) as GameStage };
    }
    if (prev.stage === 5 && prev.gameStatus === 'ROUND_WIN') {
      return { ...prev, resultOverlay: null, phase: 'FINAL_STATS', gameStatus: 'CHAMPION' };
    }
    if (prev.gameStatus === 'ROUND_LOSS') {
      return { ...prev, resultOverlay: null, phase: 'LOBBY' }; // Go back to lobby to retry or end
    }
    return { ...prev, resultOverlay: null };
  });

  const cashOut = () => {
    soundManager.play('cashOut');
    setGameState(prev => ({ ...prev, phase: 'FINAL_STATS', cashedOut: true, resultOverlay: null }));
  };

  const setPhase = (phase: GamePhase) => setGameState(prev => ({ ...prev, phase }));
  const toggleDemoMode = () => setGameState(prev => ({ ...prev, demoMode: !prev.demoMode }));
  const toggleSound = () => setGameState(prev => {
    const v = !prev.soundEnabled;
    if (v) soundManager.init();
    return { ...prev, soundEnabled: v };
  });
  const setVolume = (v: number) => setGameState(prev => ({ ...prev, volume: v }));

  return (
    <TournamentContext.Provider value={{
      gameState, startTournament, enterCurrentLevel, setPhase, cashOut,
      setPlayerIdentity, addDemoCoins, resetDemo,
      placeWager, revealTile, risk, bank,
      showResultOverlay, closeResultOverlay,
      toggleDemoMode, toggleSound, setVolume,
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) throw new Error('useTournament must be used within TournamentProvider');
  return context;
};
