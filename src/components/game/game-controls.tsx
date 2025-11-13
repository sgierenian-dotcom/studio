import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pause, Play, Menu, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';

type GameControlsProps = {
  onPause: () => void;
  isPaused: boolean;
  onNewGame: () => void;
  onExit: () => void;
};

export default function GameControls({ onPause, isPaused, onNewGame, onExit }: GameControlsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handlePauseClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent dropdown from closing
    onPause();
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="bg-transparent border-2 rounded-full w-12 h-12" style={{borderColor: '#00ff00', color: '#00ff00', boxShadow: '0 0 10px #00ff00'}}>
          {isPaused ? <Play /> : <Pause />}
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="mr-4">
        <DropdownMenuItem onClick={handlePauseClick}>
          {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onNewGame}>
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
