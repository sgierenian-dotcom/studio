'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import type { Paddle, Puck } from '@/lib/types';

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 640;
const PADDLE_RADIUS = 30;
const PUCK_RADIUS = 20;

type AirHockeyGameProps = {
  onScoreChange: (scores: { player1: number; player2: number }) => void;
  initialScores: { player1: number; player2: number };
  isPaused: boolean;
};

export default function AirHockeyGame({
  onScoreChange,
  initialScores,
  isPaused,
}: AirHockeyGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scores = useRef(initialScores);
  const player1Paddle = useRef<Paddle>({
    id: 'player1',
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 60,
    radius: PADDLE_RADIUS,
    color: '#00ff77',
    glow: '#00ff77',
  });
  const player2Paddle = useRef<Paddle>({
    id: 'player2',
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
  
  const activePaddles = useRef<Map<number, Paddle>>(new Map());
  const animationFrameId = useRef<number>();

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

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
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

    drawNeonCircle(player1Paddle.current.x, player1Paddle.current.y, player1Paddle.current.radius, player1Paddle.current.color, player1Paddle.current.glow);
    drawNeonCircle(player2Paddle.current.x, player2Paddle.current.y, player2Paddle.current.radius, player2Paddle.current.color, player2Paddle.current.glow);
    drawNeonCircle(puck.current.x, puck.current.y, puck.current.radius, puck.current.color, puck.current.glow);
  }, []);

  const gameLoop = useCallback(() => {
    if (isPaused) {
      draw();
      animationFrameId.current = requestAnimationFrame(gameLoop);
      return;
    }

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
    
    handlePaddleCollision(player1Paddle.current);
    handlePaddleCollision(player2Paddle.current);

    if (puck.current.y - puck.current.radius > CANVAS_HEIGHT) {
      scores.current.player2++;
      onScoreChange({ ...scores.current });
      resetPuck(1);
    } else if (puck.current.y + puck.current.radius < 0) {
      scores.current.player1++;
      onScoreChange({ ...scores.current });
      resetPuck(-1);
    }

    draw();

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [onScoreChange, resetPuck, isPaused, draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getPos = (clientX: number) => {
        const rect = canvas.getBoundingClientRect();
        return clientX - rect.left;
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
        if (isPaused) return;
        const touches = 'touches' in e ? e.changedTouches : [e];
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            const x = getPos(touch.clientX);
            const y = touch.clientY - canvas.getBoundingClientRect().top;

            let paddle: Paddle | null = null;
            if (y > CANVAS_HEIGHT / 2) {
                paddle = player1Paddle.current;
            } else {
                paddle = player2Paddle.current;
            }
            const dist = Math.hypot(x - paddle.x, y - paddle.y);
            if (dist < paddle.radius * 2) { // Increase activation area
                activePaddles.current.set('identifier' in touch ? touch.identifier : -1, paddle);
            }
        }
    };
    
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
        if (isPaused) return;
        if (e.cancelable) e.preventDefault();
        const touches = 'touches' in e ? e.changedTouches : [e];

        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            const identifier = 'identifier' in touch ? touch.identifier : -1;
            const activePaddle = activePaddles.current.get(identifier);

            if (activePaddle) {
                const x = getPos(touch.clientX);
                const y = touch.clientY - canvas.getBoundingClientRect().top;
                
                let min_y = 0;
                let max_y = CANVAS_HEIGHT;

                if (activePaddle.id === 'player1') {
                  min_y = CANVAS_HEIGHT / 2;
                } else {
                  max_y = CANVAS_HEIGHT / 2;
                }
                
                activePaddle.x = Math.max(PADDLE_RADIUS, Math.min(CANVAS_WIDTH - PADDLE_RADIUS, x));
                activePaddle.y = Math.max(min_y + PADDLE_RADIUS, Math.min(max_y - PADDLE_RADIUS, y));
            }
        }
    };

    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
        const touches = 'touches' in e ? e.changedTouches : [e];
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            const identifier = 'identifier' in touch ? touch.identifier : -1;
            activePaddles.current.delete(identifier);
        }
    };
    
    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('mousemove', handlePointerMove);
    document.addEventListener('mouseup', handlePointerUp);
    canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    canvas.addEventListener('touchmove', handlePointerMove, { passive: false });
    canvas.addEventListener('touchend', handlePointerUp);
    canvas.addEventListener('touchcancel', handlePointerUp);

    return () => {
        canvas.removeEventListener('mousedown', handlePointerDown);
        canvas.removeEventListener('mousemove', handlePointerMove);
        document.removeEventListener('mouseup', handlePointerUp);
        canvas.removeEventListener('touchstart', handlePointerDown);
        canvas.removeEventListener('touchmove', handlePointerMove);
        document.removeEventListener('touchend', handlePointerUp);
        canvas.removeEventListener('touchcancel', handlePointerUp);
    };
  }, [isPaused]);

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
