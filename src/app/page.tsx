'use client';

import { useState } from 'react';
import Scoreboard from '@/components/game/scoreboard';
import AirHockeyGame from '@/components/game/air-hockey-game';
import GameControls from '@/components/game/game-controls';
import GameOver from '@/components/game/game-over';
import WelcomeScreen from '@/components/game/welcome-screen';
import GameModeSelect from '@/components/game/game-mode-select';
import DifficultySelect from '@/components/game/difficulty-select';

const WINNING_SCORE = 7;
export type GameMode = 'pvp' | 'pvc';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type GameState = 'welcome' | 'mode-select' | 'difficulty-select' | 'playing' | 'paused' | 'game-over';

export default function Home() {
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [resetKey, setResetKey] = useState(0);
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [winner, setWinner] = useState<'player1' | 'player2' | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('pvc');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

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
    if (mode === 'pvc') {
      setGameState('difficulty-select');
    } else {
      resetGame();
      setGameState('playing');
    }
  };

  const handleDifficultySelect = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
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

  const handlePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  };
  
  const renderGameState = () => {
    const isGameActive = gameState === 'playing' || gameState === 'paused' || gameState === 'game-over';

    if (!isGameActive) {
      switch(gameState) {
        case 'welcome':
          return <WelcomeScreen onStart={handleStartGame} />;
        case 'mode-select':
          return <GameModeSelect onModeSelect={handleModeSelect} />;
        case 'difficulty-select':
          return <DifficultySelect onDifficultySelect={handleDifficultySelect} />;
        default:
          return <WelcomeScreen onStart={handleStartGame} />;
      }
    }
    
    return (
      <div className="relative h-screen w-screen flex items-center justify-center p-4">
        <div className="w-full h-full flex items-center justify-center">
          <AirHockeyGame
            key={resetKey}
            onScoreChange={handleScoreChange}
            initialScores={scores}
            isPaused={gameState !== 'playing'}
            gameMode={gameMode}
            difficulty={difficulty}
          />
          {gameState === 'game-over' && winner && (
            <GameOver winner={winner} onNewGame={handleNewGame} onExit={handleExit} />
          )}
        </div>
        <div className="absolute top-0 right-0 h-full flex flex-col items-center justify-center pr-4 md:pr-8 gap-4">
            <Scoreboard player2Score={scores.player2} />
            <GameControls onPause={handlePause} isPaused={gameState === 'paused'} onNewGame={handleNewGame} onExit={handleExit}/>
            <Scoreboard player1Score={scores.player1} />
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen w-screen bg-black overflow-hidden">
      {renderGameState()}
    </main>
  );
}
