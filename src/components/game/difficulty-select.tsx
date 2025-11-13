import { Button } from '@/components/ui/button';
import type { Difficulty } from '@/app/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type DifficultySelectProps = {
  onDifficultySelect: (difficulty: Difficulty) => void;
};

export default function DifficultySelect({ onDifficultySelect }: DifficultySelectProps) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-8 bg-black text-white">
        <Card className="w-[350px] text-center bg-transparent border-primary" style={{
            boxShadow: `0 0 20px hsla(var(--primary), 0.7)`,
        }}>
            <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">Choose Difficulty</CardTitle>
                <CardDescription>Select the AI opponent's skill level.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                 <Button onClick={() => onDifficultySelect('easy')} size="lg" variant="outline">
                    Easy
                </Button>
                <Button onClick={() => onDifficultySelect('medium')} size="lg" variant="outline">
                    Medium
                </Button>
                <Button onClick={() => onDifficultySelect('hard')} size="lg" variant="outline">
                    Hard
                </Button>
                <Button onClick={() => onDifficultySelect('expert')} size="lg" variant="outline">
                    Expert
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
