type ScoreboardProps = {
  player1Score: number;
  player2Score: number;
};

export default function Scoreboard({ player1Score, player2Score }: ScoreboardProps) {
  return (
    <div className="font-headline font-bold text-5xl flex justify-center gap-8">
      <div style={{ color: '#00ff77', textShadow: '0 0 15px #00ff77' }}>
        {player1Score}
      </div>
      <div style={{ color: '#b23cff', textShadow: '0 0 15px #b23cff' }}>
        {player2Score}
      </div>
    </div>
  );
}
