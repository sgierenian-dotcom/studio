import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { GameMode } from '@/app/page';

type GameControlsProps = {
  onReset: () => void;
  disabled?: boolean;
  gameMode: GameMode;
  onGameModeChange: (mode: GameMode) => void;
};

export default function GameControls({
  onReset,
  disabled = false,
  gameMode,
  onGameModeChange,
}: GameControlsProps) {
  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-4 pb-4">
       <RadioGroup
        defaultValue="pvp"
        onValueChange={(value: GameMode) => onGameModeChange(value)}
        className="flex gap-4"
        disabled={disabled}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pvp" id="pvp" />
          <Label htmlFor="pvp">Player vs Player</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pvc" id="pvc" />
          <Label htmlFor="pvc">Player vs Computer</Label>
        </div>
      </RadioGroup>
      <Button onClick={onReset} variant="outline" disabled={disabled}>
        <RotateCcw className="mr-2 h-4 w-4" />
        New Game
      </Button>
    </div>
  );
}
