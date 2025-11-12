import { Button } from '@/components/ui/button';

type WelcomeScreenProps = {
  onStart: () => void;
};

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-8 bg-black text-white">
      <h1 className="font-headline text-7xl md:text-9xl font-bold tracking-tighter" style={{ color: '#39FF14', textShadow: '0 0 20px #39FF14' }}>
        Neon Slider
      </h1>
      <p className="text-xl md:text-2xl text-center max-w-md" style={{ color: 'hsl(var(--muted-foreground))' }}>
        An AI-powered air hockey game with adaptive difficulty.
      </p>
      <Button onClick={onStart} size="lg" style={{ 
        color: '#39FF14', 
        borderColor: '#39FF14',
        boxShadow: '0 0 15px #39FF14',
        textShadow: '0 0 5px #39FF14'
      }} variant="outline">
        Start Game
      </Button>
    </div>
  );
}
