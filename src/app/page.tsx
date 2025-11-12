'use client';

import { useState } from 'react';
import Scoreboard from '@/components/game/scoreboard';
import AirHockeyGame from '@/components/game/air-hockey-game';
import GameControls from '@/components/game/game-controls';
import GameOver from '@/components/game/game-over';

const WINNING_SCORE = 7;

export default function Home() {
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [resetKey, setResetKey] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'player1' | 'player2' | null>(null);

  const handleScoreChange = (newScores: { player1: number; player2: number }) => {
    setScores(newScores);
    if (newScores.player1 >= WINNING_SCORE) {
      setWinner('player1');
      setGameOver(true);
    } else if (newScores.player2 >= WINNING_SCORE) {
      setWinner('player2');
      setGameOver(true);
    }
  };

  const handleReset = () => {
    setScores({ player1: 0, player2: 0 });
    setResetKey(prev => prev + 1);
    setGameOver(false);
    setWinner(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 gap-4">
      <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter" style={{ color: '#39FF14', textShadow: '0 0 10px #39FF14' }}>
        Neon Slider
      </h1>
      <Scoreboard player1Score={scores.player1} player2Score={scores.player2} />
      <div className="relative">
        <AirHockeyGame
          key={resetKey}
          onScoreChange={handleScoreChange}
          initialScores={scores}
          isPaused={gameOver}
        />
        {gameOver && winner && (
          <GameOver winner={winner} onNewGame={handleReset} />
        )}
      </div>
      <GameControls
        onReset={handleReset}
        disabled={gameOver}
      />
    </main>
  );
}
