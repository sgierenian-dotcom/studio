'use client';

import { useState } from 'react';
import Scoreboard from '@/components/game/scoreboard';
import AirHockeyGame from '@/components/game/air-hockey-game';
import GameControls from '@/components/game/game-controls';
import GameOver from '@/components/game/game-over';
import WelcomeScreen from '@/components/game/welcome-screen';
import GameModeSelect from '@/components/game/game-mode-select';

const WINNING_SCORE = 7;
export type GameMode = 'pvp' | 'pvc';
export type GameState = 'welcome' | 'mode-select' | 'playing' | 'game-over';

export default function Home() {
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [resetKey, setResetKey] = useState(0);
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [winner, setWinner] = useState<'player1' | 'player2' | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('pvc');

  const handleScoreChange = (newScores: { player1: number; player2: number }) => {
    setScores(newScores);
    if (newScores.player1 >= WINNING_SCORE) {
      setWinner('player1');
      setGameState('game-over');
    } else if (newScores.player2 >= WINNING_SCORE) {
      setWinner('player2');
      setGameState('game-over');
    }
  };

  const resetGame = () => {
    setScores({ player1: 0, player2: 0 });
    setResetKey(prev => prev + 1);
    setWinner(null);
  };
  
  const handleStartGame = () => {
    setGameState('mode-select');
  };
  
  const handleModeSelect = (mode: GameMode) => {
    setGameMode(mode);
    resetGame();
    setGameState('playing');
  };

  const handleNewGame = () => {
    resetGame();
    setGameState('mode-select');
  };

  const handleExit = () => {
    resetGame();
    setGameState('welcome');
  };
  
  const renderGameState = () => {
    switch(gameState) {
      case 'welcome':
        return <WelcomeScreen onStart={handleStartGame} />;
      case 'mode-select':
        return <GameModeSelect onModeSelect={handleModeSelect} />;
      case 'playing':
      case 'game-over':
        return (
          <div className="flex h-screen w-screen flex-col items-center justify-center p-4 md:p-8 gap-4">
            <h1 className="font-headline text-6xl md:text-7xl font-bold tracking-tighter" style={{ color: '#39FF14', textShadow: '0 0 10px #39FF14' }}>
              Neon Slider
            </h1>
            <Scoreboard player1Score={scores.player1} player2Score={scores.player2} />
            <div className="relative w-full flex-1 flex justify-center items-center">
              <AirHockeyGame
                key={resetKey}
                onScoreChange={handleScoreChange}
                initialScores={scores}
                isPaused={gameState === 'game-over'}
                gameMode={gameMode}
              />
              {gameState === 'game-over' && winner && (
                <GameOver winner={winner} onNewGame={handleNewGame} />
              )}
            </div>
            <GameControls onReset={handleNewGame} onExit={handleExit} />
          </div>
        );
    }
  }

  return (
    <main className="h-screen w-screen bg-black">
      {renderGameState()}
    </main>
  );
}
