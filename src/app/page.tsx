'use client';

import { useState } from 'react';
import Scoreboard from '@/components/game/scoreboard';
import AirHockeyGame from '@/components/game/air-hockey-game';
import GameControls from '@/components/game/game-controls';
import GameOver from '@/components/game/game-over';

const WINNING_SCORE = 7;

export default function Home() {
  const [scores, setScores] = useState({ player: 0, ai: 0 });
  const [difficulty, setDifficulty] = useState(0.5);
  const [resetKey, setResetKey] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);

  const handleScoreChange = (newScores: { player: number; ai: number }) => {
    setScores(newScores);
    if (newScores.player >= WINNING_SCORE) {
      setWinner('player');
      setGameOver(true);
    } else if (newScores.ai >= WINNING_SCORE) {
      setWinner('ai');
      setGameOver(true);
    }
  };

  const handleReset = () => {
    setScores({ player: 0, ai: 0 });
    setResetKey(prev => prev + 1);
    setGameOver(false);
    setWinner(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 gap-4">
      <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter" style={{ color: '#39FF14', textShadow: '0 0 10px #39FF14' }}>
        Neon Slider
      </h1>
      <Scoreboard player1Score={scores.player} player2Score={scores.ai} />
      <div className="relative">
        <AirHockeyGame
          key={resetKey}
          difficulty={difficulty}
          onScoreChange={handleScoreChange}
          initialScores={scores}
          isPaused={gameOver}
        />
        {gameOver && winner && (
          <GameOver winner={winner} onNewGame={handleReset} />
        )}
      </div>
      <GameControls
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        onReset={handleReset}
        disabled={gameOver}
      />
    </main>
  );
}
