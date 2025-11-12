import { Button } from '@/components/ui/button';
import type { GameMode } from '@/app/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type GameModeSelectProps = {
  onModeSelect: (mode: GameMode) => void;
};

export default function GameModeSelect({ onModeSelect }: GameModeSelectProps) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-8 bg-black text-white">
        <Card className="w-[350px] text-center bg-transparent border-primary" style={{
            boxShadow: `0 0 20px hsla(var(--primary), 0.7)`,
        }}>
            <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">Choose Game Mode</CardTitle>
                <CardDescription>Select how you want to play.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                 <Button onClick={() => onModeSelect('pvc')} size="lg" variant="outline">
                    Player vs Computer
                </Button>
                <Button onClick={() => onModeSelect('pvp')} size="lg" variant="outline">
                    Player vs Player
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
