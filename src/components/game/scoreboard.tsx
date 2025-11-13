
type ScoreboardProps = {
  player1Score?: number;
  player2Score?: number;
};

export default function Scoreboard({ player1Score, player2Score }: ScoreboardProps) {
  const score = player1Score ?? player2Score ?? 0;
  const color = player1Score !== undefined ? '#00ff00' : '#00ff00';
  
  return (
    <div 
      className="font-headline font-bold text-6xl"
      style={{
        color: color,
        textShadow: `0 0 20px ${color}, 0 0 30px ${color}`,
        transform: 'rotate(90deg)',
      }}
    >
      {score}
    </div>
  );
}
