import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, X } from 'lucide-react';

type GameOverProps = {
  winner: 'player1' | 'player2';
  onNewGame: () => void;
  onExit: () => void;
};

export default function GameOver({ winner, onNewGame, onExit }: GameOverProps) {
  const winnerText = winner === 'player1' ? 'You Win!' : 'Computer Wins!';
  const winnerColor = winner === 'player1' ? '#ff0000' : '#00ff00';

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
      <Card className="w-[300px] text-center bg-transparent" style={{
        boxShadow: `0 0 20px ${winnerColor}, inset 0 0 10px ${winnerColor}`,
        borderColor: winnerColor,
      }}>
        <CardHeader>
          <CardTitle className="text-4xl font-bold" style={{ color: winnerColor, textShadow: `0 0 10px ${winnerColor}`}}>
            Game Over
          </CardTitle>
          <CardDescription className="text-2xl pt-2">{winnerText}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={onNewGame} variant="outline" size="lg">
            <RotateCcw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
          <Button onClick={onExit} variant="outline" size="lg">
             <X className="mr-2 h-4 w-4" />
            Exit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
