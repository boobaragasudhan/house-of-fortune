// ── Fortune Draw Symbols ──
export type FortuneSymbol = 'FORTUNE' | 'CROWN' | 'GOLD' | 'SPADE' | 'DIAMOND' | 'VAULT' | 'SHADOW' | 'RISK' | 'WILD';

// ── Tile State ──
export type TileStatus = 'HIDDEN' | 'REVEALED' | 'LOCKED';

export type FortuneTile = {
  id: number;
  symbol: FortuneSymbol;
  status: TileStatus;
};

// ── Competitors ──
export type Competitor = {
  id: string;
  name: string;
  isPlayer: boolean;
  score: number;
  eliminated: boolean;
  rank: number | null;
};

// ── Transactions ──
export type TransactionType = 'DEMO_ADD' | 'WAGER' | 'GAME_REWARD' | 'TOURNAMENT_SECURED' | 'RESET';

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  label: string;
  timestamp: string;
};

// ── Games ──
export type GamePhase =
  | 'HOME'
  | 'LOBBY'
  | 'FORTUNE_DRAW'
  | 'FINAL_STATS';

export type GameStatus =
  | 'WAITING_FOR_WAGER'
  | 'BOARD_ACTIVE'
  | 'REVEALING'
  | 'WAITING_VRF'
  | 'WIN'
  | 'LOSS'
  | 'ROUND_WIN'
  | 'ROUND_LOSS'
  | 'CASHOUT_DECISION'
  | 'CASHED_OUT'
  | 'ELIMINATED'
  | 'CHAMPION';

export type GameStage = 1 | 2 | 3 | 4 | 5;

export type OverlayType = 'WIN' | 'LOSS' | 'ROUND_WIN' | 'ROUND_LOSS' | 'CHAMPION' | 'CASHOUT';

export type ResultOverlayData = {
  type: OverlayType;
  title: string;
  subtitle: string;
  reward: number;
  secured: number;
  bet: number;
  round: number;
  playerName: string;
  teamName: string;
} | null;

// ── Game State ──
export type GameState = {
  phase: GamePhase;
  stage: GameStage;
  gameStatus: GameStatus;
  
  // Customization
  playerName: string;
  teamName: string;
  
  competitors: Competitor[];
  
  // Wallet / Betting / History
  playerCoins: number; // Available virtual coins
  securedReward: number; // Protected tournament progress
  activeWager: number;
  currentPotentialReward: number;
  totalTournamentReward: number;
  transactions: Transaction[];
  
  // Fortune Draw State
  board: FortuneTile[];
  
  // Hand Result / Overlays
  lastStageResult: {
    won: boolean;
    reward: number;
    detail: string;
  } | null;
  resultOverlay: ResultOverlayData;
  
  // UI / App State
  isProcessing: boolean;
  soundEnabled: boolean;
  volume: number;
  demoMode: boolean;
  cashedOut: boolean;
};
