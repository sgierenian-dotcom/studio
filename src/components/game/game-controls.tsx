import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

type GameControlsProps = {
  onReset: () => void;
  disabled?: boolean;
};

export default function GameControls({
  onReset,
  disabled = false,
}: GameControlsProps) {
  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-4 mt-4">
      <Button onClick={onReset} variant="outline" disabled={disabled}>
        <RotateCcw className="mr-2 h-4 w-4" />
        New Game
      </Button>
    </div>
  );
}
