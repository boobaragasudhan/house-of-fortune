import { useState } from 'react';
import { useTournament } from './game/tournamentContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Lobby } from './pages/Lobby';
import { FortuneDrawStage } from './pages/FortuneDrawStage';
import { Winner } from './pages/Winner';
import { IntroSequence } from './pages/IntroSequence';
import { CinematicResultOverlay } from './components/CinematicResultOverlay';

function AppContent({ onReplayIntro }: { onReplayIntro: () => void }) {
  const { gameState, closeResultOverlay, cashOut, startTournament } = useTournament();

  const handleOverlayContinue = () => {
    closeResultOverlay();
  };

  const handleOverlayCashOut = () => {
    closeResultOverlay();
    cashOut();
  };

  const handleOverlayPlayAgain = () => {
    closeResultOverlay();
    startTournament();
  };

  return (
    <>
      <Header onReplayIntro={onReplayIntro} />
      <main className="pt-16 min-h-screen bg-[#090909]">
        {gameState.phase === 'HOME' && <Home />}
        {gameState.phase === 'LOBBY' && <Lobby />}
        {gameState.phase === 'FORTUNE_DRAW' && <FortuneDrawStage />}
        {gameState.phase === 'FINAL_STATS' && <Winner />}
      </main>

      {/* Full-Screen Cinematic Result Overlay */}
      {gameState.resultOverlay && (
        <CinematicResultOverlay
          data={gameState.resultOverlay}
          onContinue={handleOverlayContinue}
          onCashOut={gameState.securedReward > 0 ? handleOverlayCashOut : undefined}
          onPlayAgain={gameState.phase === 'FINAL_STATS' ? handleOverlayPlayAgain : undefined}
          onSkip={closeResultOverlay}
        />
      )}
    </>
  );
}

function App() {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleReplayIntro = () => {
    setShowIntro(true);
  };

  return (
    <div className="min-h-screen bg-[#090909] text-[#F5F0E6] relative">
      {/* Game content — always rendered underneath */}
      <AppContent onReplayIntro={handleReplayIntro} />

      {/* Intro overlay — on top (z-50 / z-9999), removed when done */}
      {showIntro && <IntroSequence onComplete={handleIntroComplete} />}
    </div>
  );
}

export default App;
