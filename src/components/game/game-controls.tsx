import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

type GameControlsProps = {
  difficulty: number;
  onDifficultyChange: (value: number) => void;
  onReset: () => void;
  disabled?: boolean;
};

export default function GameControls({
  difficulty,
  onDifficultyChange,
  onReset,
  disabled = false,
}: GameControlsProps) {
  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-4 mt-4">
      <div className="w-full grid gap-2">
        <Label htmlFor="difficulty" className="font-headline text-center text-lg text-primary" style={{ textShadow: '0 0 5px hsl(var(--primary))'}}>
          AI Difficulty
        </Label>
        <Slider
          id="difficulty"
          min={0}
          max={1}
          step={0.1}
          value={[difficulty]}
          onValueChange={(value) => onDifficultyChange(value[0])}
          disabled={disabled}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Easy</span>
          <span>Hard</span>
        </div>
      </div>
      <Button onClick={onReset} variant="outline" disabled={disabled}>
        <RotateCcw className="mr-2 h-4 w-4" />
        New Game
      </Button>
    </div>
  );
}
