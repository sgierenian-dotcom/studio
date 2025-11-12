import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw } from 'lucide-react';

type GameOverProps = {
  winner: 'player1' | 'player2';
  onNewGame: () => void;
};

export default function GameOver({ winner, onNewGame }: GameOverProps) {
  const winnerText = winner === 'player1' ? 'Player 1 Wins!' : 'Player 2 Wins!';
  const winnerColor = winner === 'player1' ? '#00ff77' : '#b23cff';

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl">
      <Card className="w-[300px] text-center" style={{
        boxShadow: `0 0 20px ${winnerColor}, inset 0 0 10px ${winnerColor}`,
        borderColor: winnerColor,
      }}>
        <CardHeader>
          <CardTitle className="text-3xl font-bold" style={{ color: winnerColor, textShadow: `0 0 10px ${winnerColor}`}}>
            Game Over
          </CardTitle>
          <CardDescription className="text-xl pt-2">{winnerText}</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button onClick={onNewGame}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
