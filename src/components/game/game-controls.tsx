import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, RotateCcw, X } from 'lucide-react';

type GameControlsProps = {
  onReset: () => void;
  onExit: () => void;
};

export default function GameControls({ onReset, onExit }: GameControlsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          <span>New Game</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExit}>
          <X className="mr-2 h-4 w-4" />
          <span>Exit</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
