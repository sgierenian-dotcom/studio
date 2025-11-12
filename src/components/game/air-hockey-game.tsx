'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import type { Paddle, Puck } from '@/lib/types';
import type { GameMode } from '@/app/page';

const BASE_CANVAS_WIDTH = 360;
const BASE_CANVAS_HEIGHT = 640;
const PADDLE_RADIUS = 30;
const PUCK_RADIUS = 20;

type AirHockeyGameProps = {
  onScoreChange: (scores: { player1: number; player2: number }) => void;
  initialScores: { player1: number; player2: number };
  isPaused: boolean;
  gameMode: GameMode;
};

export default function AirHockeyGame({
  onScoreChange,
  initialScores,
  isPaused,
  gameMode,
}: AirHockeyGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scores = useRef(initialScores);

  const scale = useRef(1);
  const canvasSize = useRef({ width: BASE_CANVAS_WIDTH, height: BASE_CANVAS_HEIGHT });

  const player1Paddle = useRef<Paddle>({
    id: 'player1',
    x: canvasSize.current.width / 2,
    y: canvasSize.current.height - 60,
    radius: PADDLE_RADIUS,
    color: '#00ff77',
    glow: '#00ff77',
  });
  const player2Paddle = useRef<Paddle>({
    id: 'player2',
    x: canvasSize.current.width / 2,
    y: 60,
    radius: PADDLE_RADIUS,
    color: '#b23cff',
    glow: '#b23cff',
  });
  const puck = useRef<Puck>({
    x: canvasSize.current.width / 2,
    y: canvasSize.current.height / 2,
    vx: 0,
    vy: 0,
    radius: PUCK_RADIUS,
    color: '#fff',
    glow: '#fff',
  });
  
  const activePaddles = useRef<Map<number, Paddle>>(new Map());
  const animationFrameId = useRef<number>();

  const resetPuck = useCallback((direction: number) => {
    const { width, height } = canvasSize.current;
    puck.current.x = width / 2;
    puck.current.y = height / 2;
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
    
    const { width, height } = canvasSize.current;
    ctx.clearRect(0, 0, width, height);
    
    const drawNeonCircle = (x: number, y: number, radius: number, color: string, glowColor: string) => {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 25 * scale.current;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;
    };
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 4 * scale.current;
    ctx.setLineDash([15, 15]);
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.lineWidth = 3 * scale.current;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 60 * scale.current, 0, 2 * Math.PI);
    ctx.stroke();

    drawNeonCircle(player1Paddle.current.x, player1Paddle.current.y, player1Paddle.current.radius, player1Paddle.current.color, player1Paddle.current.glow);
    drawNeonCircle(player2Paddle.current.x, player2Paddle.current.y, player2Paddle.current.radius, player2Paddle.current.color, player2Paddle.current.glow);
    drawNeonCircle(puck.current.x, puck.current.y, puck.current.radius, puck.current.color, puck.current.glow);
  }, []);
  
  const updateCanvasSize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
    const aspectRatio = BASE_CANVAS_WIDTH / BASE_CANVAS_HEIGHT;
    
    let newWidth = containerWidth;
    let newHeight = containerWidth / aspectRatio;

    if (newHeight > containerHeight) {
      newHeight = containerHeight;
      newWidth = containerHeight * aspectRatio;
    }

    canvasSize.current = { width: newWidth, height: newHeight };
    scale.current = newWidth / BASE_CANVAS_WIDTH;
    
    canvas.width = newWidth;
    canvas.height = newHeight;

    player1Paddle.current.radius = PADDLE_RADIUS * scale.current;
    player2Paddle.current.radius = PADDLE_RADIUS * scale.current;
    puck.current.radius = PUCK_RADIUS * scale.current;

    player1Paddle.current.x = newWidth / 2;
    player1Paddle.current.y = newHeight - (60 * scale.current);
    player2Paddle.current.x = newWidth / 2;
    player2Paddle.current.y = 60 * scale.current;
    
    resetPuck(puck.current.vy > 0 ? 1 : -1);
    draw();
  }, [draw, resetPuck]);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  const updateAI = useCallback(() => {
    const { width, height } = canvasSize.current;
    const paddle = player2Paddle.current;
    const reactionSpeed = 0.1; 
    const errorMargin = 0.05;

    let targetX = puck.current.x;

    if (puck.current.vy < 0) { 
        const timeToReachPaddle = (paddle.y - puck.current.y) / puck.current.vy;
        let predictedX = puck.current.x + puck.current.vx * timeToReachPaddle;

        if (predictedX < 0) predictedX = -predictedX;
        if (predictedX > width) predictedX = width - (predictedX - width);
        targetX = predictedX;
    }

    targetX += (Math.random() - 0.5) * paddle.radius * errorMargin;

    const dx = targetX - paddle.x;
    paddle.x += dx * reactionSpeed;

    let targetY = 60 * scale.current;
    if (puck.current.y < height / 2) {
      targetY = Math.max(puck.current.y + puck.current.radius, 60 * scale.current);
    }
    const dy = targetY - paddle.y;
    paddle.y += dy * 0.1;

    paddle.x = Math.max(paddle.radius, Math.min(width - paddle.radius, paddle.x));
    paddle.y = Math.max(paddle.radius, Math.min(height / 2 - paddle.radius, paddle.y));
  }, [scale]);

  const gameLoop = useCallback(() => {
    if (isPaused) {
      draw();
      animationFrameId.current = requestAnimationFrame(gameLoop);
      return;
    }

    if (gameMode === 'pvc') {
      updateAI();
    }

    const { width, height } = canvasSize.current;

    puck.current.x += puck.current.vx * scale.current;
    puck.current.y += puck.current.vy * scale.current;

    if (puck.current.x - puck.current.radius < 0) {
      puck.current.x = puck.current.radius;
      puck.current.vx *= -1;
    }
    if (puck.current.x + puck.current.radius > width) {
      puck.current.x = width - puck.current.radius;
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

        const overlap = paddle.radius + puck.current.radius - dist;
        puck.current.x += nx * (overlap + 1);
        puck.current.y += ny * (overlap + 1);
      }
    };
    
    handlePaddleCollision(player1Paddle.current);
    handlePaddleCollision(player2Paddle.current);

    if (puck.current.y - puck.current.radius > height) {
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
  }, [onScoreChange, resetPuck, isPaused, draw, gameMode, updateAI]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getPos = (clientX: number, clientY: number) => {
        const rect = canvas.getBoundingClientRect();
        return {
          x: clientX - rect.left,
          y: clientY - rect.top,
        };
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
        if (isPaused) return;
        const touches = 'touches' in e ? e.changedTouches : [e];
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            const {x, y} = getPos(touch.clientX, touch.clientY);
            const { height } = canvasSize.current;

            let paddle: Paddle | null = null;
            
            if (y > height / 2) {
                paddle = player1Paddle.current;
            } else if (gameMode === 'pvp') {
                paddle = player2Paddle.current;
            }
            
            if (paddle) {
                const dist = Math.hypot(x - paddle.x, y - paddle.y);
                if (dist < paddle.radius * 2.5) { // Increase activation area
                    activePaddles.current.set('identifier' in touch ? touch.identifier : -1, paddle);
                }
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
                const {x, y} = getPos(touch.clientX, touch.clientY);
                const { width, height } = canvasSize.current;
                
                let minY = 0;
                let maxY = height;

                if (activePaddle.id === 'player1') {
                  minY = height / 2;
                } else {
                  maxY = height / 2;
                }
                
                activePaddle.x = Math.max(activePaddle.radius, Math.min(width - activePaddle.radius, x));
                activePaddle.y = Math.max(minY + activePaddle.radius, Math.min(maxY - activePaddle.radius, y));
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
  }, [isPaused, gameMode]);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameLoop]);

  return (
    <div ref={containerRef} className="w-full h-full flex justify-center items-center">
        <canvas
        ref={canvasRef}
        className="rounded-xl shadow-lg bg-card"
        style={{
            boxShadow: `0 0 30px hsla(var(--primary), 0.5), 0 0 30px hsla(var(--accent), 0.5)`,
        }}
        />
    </div>
  );
}
