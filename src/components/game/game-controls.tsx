import { Button } from '@/components/ui/button';
import { RotateCcw, X } from 'lucide-react';

type GameControlsProps = {
  onReset: () => void;
  onExit: () => void;
};

export default function GameControls({ onReset, onExit }: GameControlsProps) {
  return (
    <div className="w-full max-w-sm flex items-center justify-center gap-4 pb-4">
      <Button onClick={onReset} variant="outline">
        <RotateCcw className="mr-2 h-4 w-4" />
        New Game
      </Button>
      <Button onClick={onExit} variant="destructive">
        <X className="mr-2 h-4 w-4" />
        Exit
      </Button>
    </div>
  );
}
