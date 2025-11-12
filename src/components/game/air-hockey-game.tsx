'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAiPaddlePosition } from '@/ai/flows/ai-adaptive-opponent';
import type { AIPaddlePositionInput } from '@/ai/flows/ai-adaptive-opponent';
import type { Paddle, Puck } from '@/lib/types';

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 640;
const PADDLE_RADIUS = 30;
const PUCK_RADIUS = 20;
const AI_CALL_INTERVAL = 250; // ms

type AirHockeyGameProps = {
  difficulty: number;
  onScoreChange: (scores: { player: number; ai: number }) => void;
  initialScores: { player: number; ai: number };
};

export default function AirHockeyGame({
  difficulty,
  onScoreChange,
  initialScores,
}: AirHockeyGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const scores = useRef(initialScores);
  const playerPaddle = useRef<Paddle>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 60,
    radius: PADDLE_RADIUS,
    color: '#00ff77',
    glow: '#00ff77',
  });
  const aiPaddle = useRef<Paddle>({
    x: CANVAS_WIDTH / 2,
    y: 60,
    radius: PADDLE_RADIUS,
    color: '#b23cff',
    glow: '#b23cff',
  });
  const puck = useRef<Puck>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    vx: 0,
    vy: 0,
    radius: PUCK_RADIUS,
    color: '#fff',
    glow: '#fff',
  });
  
  const activePaddle = useRef<Paddle | null>(null);
  const animationFrameId = useRef<number>();
  const lastAiCallTimestamp = useRef(0);
  const aiTargetX = useRef(CANVAS_WIDTH / 2);

  const resetPuck = useCallback((direction: number) => {
    puck.current.x = CANVAS_WIDTH / 2;
    puck.current.y = CANVAS_HEIGHT / 2;
    puck.current.vx = 4 * (Math.random() > 0.5 ? 1 : -1);
    puck.current.vy = 4 * direction;
  }, []);

  useEffect(() => {
    scores.current = initialScores;
    resetPuck(Math.random() > 0.5 ? 1 : -1);
  }, [initialScores, resetPuck]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const now = Date.now();
    if (now - lastAiCallTimestamp.current > AI_CALL_INTERVAL) {
      lastAiCallTimestamp.current = now;
      const aiInput: AIPaddlePositionInput = {
        puckX: puck.current.x,
        puckY: puck.current.y,
        paddleX: aiPaddle.current.x,
        paddleY: aiPaddle.current.y,
        difficulty: difficulty,
      };

      getAiPaddlePosition(aiInput)
        .then(res => {
          if (res && typeof res.x === 'number') {
            aiTargetX.current = Math.max(PADDLE_RADIUS, Math.min(CANVAS_WIDTH - PADDLE_RADIUS, res.x));
          }
        })
        .catch(err => {
          console.error("AI Error:", err);
          toast({
            variant: "destructive",
            title: "AI Error",
            description: "Could not get AI opponent's move.",
          });
        });
    }

    aiPaddle.current.x += (aiTargetX.current - aiPaddle.current.x) * 0.15;

    puck.current.x += puck.current.vx;
    puck.current.y += puck.current.vy;

    if (puck.current.x - puck.current.radius < 0) {
      puck.current.x = puck.current.radius;
      puck.current.vx *= -1;
    }
    if (puck.current.x + puck.current.radius > CANVAS_WIDTH) {
      puck.current.x = CANVAS_WIDTH - puck.current.radius;
      puck.current.vx *= -1;
    }

    const handlePaddleCollision = (paddle: Paddle) => {
      const dx = puck.current.x - paddle.x;
      const dy = puck.current.y - paddle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < paddle.radius + puck.current.radius) {
        const nx = dx / dist;
        const ny = dy / dist;

        const dot = puck.current.vx * nx + puck.current.vy * ny;
        puck.current.vx -= 2 * dot * nx;
        puck.current.vy -= 2 * dot * ny;
        puck.current.vx *= 1.05;
        puck.current.vy *= 1.05;
        
        const maxSpeed = 15;
        const speed = Math.sqrt(puck.current.vx * puck.current.vx + puck.current.vy * puck.current.vy);
        if (speed > maxSpeed) {
          puck.current.vx = (puck.current.vx / speed) * maxSpeed;
          puck.current.vy = (puck.current.vy / speed) * maxSpeed;
        }

        puck.current.x = paddle.x + nx * (paddle.radius + puck.current.radius);
        puck.current.y = paddle.y + ny * (paddle.radius + puck.current.radius);
      }
    };
    
    if (puck.current.vy > 0) handlePaddleCollision(playerPaddle.current);
    if (puck.current.vy < 0) handlePaddleCollision(aiPaddle.current);

    if (puck.current.y - puck.current.radius > CANVAS_HEIGHT) {
      scores.current.ai++;
      onScoreChange({ ...scores.current });
      resetPuck(1);
    } else if (puck.current.y + puck.current.radius < 0) {
      scores.current.player++;
      onScoreChange({ ...scores.current });
      resetPuck(-1);
    }

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const drawNeonCircle = (x: number, y: number, radius: number, color: string, glowColor: string) => {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 25;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;
    };
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 4;
    ctx.setLineDash([15, 15]);
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT / 2);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 60, 0, 2 * Math.PI);
    ctx.stroke();

    drawNeonCircle(playerPaddle.current.x, playerPaddle.current.y, playerPaddle.current.radius, playerPaddle.current.color, playerPaddle.current.glow);
    drawNeonCircle(aiPaddle.current.x, aiPaddle.current.y, aiPaddle.current.radius, aiPaddle.current.color, aiPaddle.current.glow);
    drawNeonCircle(puck.current.x, puck.current.y, puck.current.radius, puck.current.color, puck.current.glow);

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [difficulty, onScoreChange, resetPuck, toast]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getPos = (e: MouseEvent | TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        return clientX - rect.left;
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
        const x = getPos(e);
        const y = 'touches' in e ? e.touches[0].clientY - canvas.getBoundingClientRect().top : e.clientY - canvas.getBoundingClientRect().top;
        
        if (y > CANVAS_HEIGHT / 2) {
            const dist = Math.hypot(x - playerPaddle.current.x, y - playerPaddle.current.y);
            if (dist < playerPaddle.current.radius) {
                activePaddle.current = playerPaddle.current;
            }
        }
    };
    
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
        if (!activePaddle.current) return;
        if (e.cancelable) e.preventDefault();
        const x = getPos(e);
        activePaddle.current.x = Math.max(PADDLE_RADIUS, Math.min(CANVAS_WIDTH - PADDLE_RADIUS, x));
    };

    const handlePointerUp = () => {
        activePaddle.current = null;
    };
    
    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('mousemove', handlePointerMove);
    document.addEventListener('mouseup', handlePointerUp);
    canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    canvas.addEventListener('touchmove', handlePointerMove, { passive: false });
    document.addEventListener('touchend', handlePointerUp);

    return () => {
        canvas.removeEventListener('mousedown', handlePointerDown);
        canvas.removeEventListener('mousemove', handlePointerMove);
        document.removeEventListener('mouseup', handlePointerUp);
        canvas.removeEventListener('touchstart', handlePointerDown);
        canvas.removeEventListener('touchmove', handlePointerMove);
        document.removeEventListener('touchend', handlePointerUp);
    };
  }, []);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameLoop]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="rounded-xl shadow-lg bg-card"
      style={{
        boxShadow: `0 0 30px hsla(var(--primary), 0.5), 0 0 30px hsla(var(--accent), 0.5)`,
      }}
    />
  );
}
