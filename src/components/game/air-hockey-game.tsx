'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import type { Paddle, Puck } from '@/lib/types';
import type { GameMode, Difficulty } from '@/app/page';

const BASE_CANVAS_WIDTH = 360;
const BASE_CANVAS_HEIGHT = 640;
const PADDLE_RADIUS = 30;
const PUCK_RADIUS = 20;

const DIFFICULTY_SETTINGS = {
  easy: { speed: 0.04, prediction: 0.2 },
  medium: { speed: 0.08, prediction: 0.5 },
  hard: { speed: 0.12, prediction: 0.8 },
  expert: { speed: 0.2, prediction: 1.0 },
};

type AirHockeyGameProps = {
  onScoreChange: (scores: { player1: number; player2: number }) => void;
  initialScores: { player1: number; player2: number };
  isPaused: boolean;
  gameMode: GameMode;
  difficulty: Difficulty;
};

export default function AirHockeyGame({
  onScoreChange,
  initialScores,
  isPaused,
  gameMode,
  difficulty,
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
    vx: 0,
    vy: 0,
    lastX: canvasSize.current.width / 2,
    lastY: canvasSize.current.height - 60,
  });
  const player2Paddle = useRef<Paddle>({
    id: 'player2',
    x: canvasSize.current.width / 2,
    y: 60,
    radius: PADDLE_RADIUS,
    color: '#b23cff',
    glow: '#b23cff',
    vx: 0,
    vy: 0,
    lastX: canvasSize.current.width / 2,
    lastY: 60,
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
  
  const activePointers = useRef<Map<number, Paddle>>(new Map());
  const animationFrameId = useRef<number>();

  const resetPuck = useCallback((direction: number) => {
    const { width, height } = canvasSize.current;
    puck.current.x = width / 2;
    puck.current.y = height / 2;
    puck.current.vx = 0;
    puck.current.vy = direction * (4 * scale.current);
  }, []);

  useEffect(() => {
    scores.current = initialScores;
  }, [initialScores]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvasSize.current;
    ctx.clearRect(0, 0, width, height);
    
    const drawNeonCircle = (x: number, y: number, radius: number, color: string, glowColor: string) => {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 20 * scale.current;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
    };
    
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2 * scale.current;
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    ctx.lineWidth = 1 * scale.current;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 60 * scale.current, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();

    drawNeonCircle(player1Paddle.current.x, player1Paddle.current.y, player1Paddle.current.radius, player1Paddle.current.color, player1Paddle.current.glow);
    drawNeonCircle(player2Paddle.current.x, player2Paddle.current.y, player2Paddle.current.radius, player2Paddle.current.color, player2Paddle.current.glow);
    drawNeonCircle(puck.current.x, puck.current.y, puck.current.radius, puck.current.color, puck.current.glow);
    ctx.shadowBlur = 0;
  }, [scale]);
  
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

    canvas.width = newWidth;
    canvas.height = newHeight;
    canvasSize.current = { width: newWidth, height: newHeight };
    scale.current = newWidth / BASE_CANVAS_WIDTH;
    
    player1Paddle.current.radius = PADDLE_RADIUS * scale.current;
    player2Paddle.current.radius = PADDLE_RADIUS * scale.current;
    puck.current.radius = PUCK_RADIUS * scale.current;
    
    player1Paddle.current.x = newWidth / 2;
    player1Paddle.current.y = newHeight - (60 * scale.current);
    player2Paddle.current.x = newWidth / 2;
    player2Paddle.current.y = 60 * scale.current;
    
    resetPuck(Math.random() > 0.5 ? 1 : -1);
    draw();
  }, [draw, resetPuck]);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  const updateAI = useCallback(() => {
    const paddle = player2Paddle.current;
    const { width, height } = canvasSize.current;
    const settings = DIFFICULTY_SETTINGS[difficulty];

    let targetX = width / 2;
    let targetY = 60 * scale.current;

    // Puck is on AI's side or moving towards it
    if (puck.current.y < height / 2 || puck.current.vy < 0) {
      // Offensive/Aggressive logic
      const timeToIntercept = Math.abs((puck.current.y - paddle.y) / puck.current.vy) * settings.prediction;
      let predictedX = puck.current.x + puck.current.vx * timeToIntercept;

      // Basic wall bounce prediction
      if (predictedX < 0) predictedX = -predictedX;
      if (predictedX > width) predictedX = 2 * width - predictedX;
      
      targetX = predictedX;
      targetY = Math.max(puck.current.y, paddle.radius);

    } else {
      // Defensive position: return to center goal
      targetX = width / 2;
      targetY = 60 * scale.current;
    }

    // Clamp target to AI's side
    targetX = Math.max(paddle.radius, Math.min(width - paddle.radius, targetX));
    targetY = Math.max(paddle.radius, Math.min(height / 2 - paddle.radius, targetY));
  
    // Interpolate paddle position towards target position
    paddle.x += (targetX - paddle.x) * settings.speed;
    paddle.y += (targetY - paddle.y) * settings.speed;
  }, [difficulty, scale]);

  const handleCollision = (paddle: Paddle, puck: Puck) => {
    const dx = puck.x - paddle.x;
    const dy = puck.y - paddle.y;
    const distance = Math.hypot(dx, dy);
    const min_dist = paddle.radius + puck.radius;
  
    if (distance < min_dist) {
      // Resolve overlap
      const overlap = min_dist - distance;
      const nx = dx / distance;
      const ny = dy / distance;
      puck.x += nx * overlap;
      puck.y += ny * overlap;
  
      // Elastic collision response
      const angle = Math.atan2(dy, dx);
      const sine = Math.sin(angle);
      const cosine = Math.cos(angle);
  
      // Rotate puck's velocity
      const vx1 = puck.vx * cosine + puck.vy * sine;
      const vy1 = puck.vy * cosine - puck.vx * sine;
  
      // Final velocities
      let vx_final = -vx1;
      const vy_final = vy1;
  
      // Add paddle velocity to the puck
      const paddle_vx = paddle.x - paddle.lastX;
      const paddle_vy = paddle.y - paddle.lastY;
      vx_final += paddle_vx * 0.4;
  
      // Rotate back
      puck.vx = vx_final * cosine - vy_final * sine;
      puck.vy = vy_final * cosine + vx_final * sine;
  
      // Add a constant minimum speed to prevent sticking
      const overall_speed = Math.hypot(puck.vx, puck.vy);
      const boost = 1.1 + Math.abs(paddle_vx) * 0.1;
      puck.vx = (puck.vx / overall_speed) * (overall_speed * boost);
      puck.vy = (puck.vy / overall_speed) * (overall_speed * boost);

      const maxSpeed = 15 * scale.current;
      const currentSpeed = Math.hypot(puck.vx, puck.vy);
      if (currentSpeed > maxSpeed) {
        puck.vx = (puck.vx / currentSpeed) * maxSpeed;
        puck.vy = (puck.vy / currentSpeed) * maxSpeed;
      }
    }
  };

  const gameLoop = useCallback(() => {
    if (isPaused) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
      return;
    }

    const p1 = player1Paddle.current;
    const p2 = player2Paddle.current;

    p1.lastX = p1.x;
    p1.lastY = p1.y;
    p2.lastX = p2.x;
    p2.lastY = p2.y;

    if (gameMode === 'pvc') {
      updateAI();
    }

    const { width, height } = canvasSize.current;

    puck.current.x += puck.current.vx;
    puck.current.y += puck.current.vy;

    const FRICTION = 0.995;
    puck.current.vx *= FRICTION;
    puck.current.vy *= FRICTION;

    if (puck.current.x - puck.current.radius < 0) {
      puck.current.x = puck.current.radius;
      puck.current.vx *= -1;
    }
    if (puck.current.x + puck.current.radius > width) {
      puck.current.x = width - puck.current.radius;
      puck.current.vx *= -1;
    }

    handleCollision(player1Paddle.current, puck.current);
    handleCollision(player2Paddle.current, puck.current);

    if (puck.current.y + puck.current.radius < 0) {
      scores.current.player1++;
      onScoreChange({ ...scores.current });
      resetPuck(-1);
    } else if (puck.current.y - puck.current.radius > height) {
      scores.current.player2++;
      onScoreChange({ ...scores.current });
      resetPuck(1);
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

    const handlePointerDown = (e: PointerEvent) => {
        if (isPaused) return;
        const {x, y} = getPos(e.clientX, e.clientY);
        const { height } = canvasSize.current;

        let paddle: Paddle | null = null;
        
        if (y > height / 2) {
            paddle = player1Paddle.current;
        } else if (gameMode === 'pvp') {
            paddle = player2Paddle.current;
        }
        
        if (paddle) {
          activePointers.current.set(e.pointerId, paddle);
          (e.target as HTMLElement)?.setPointerCapture(e.pointerId);
        }
    };
    
    const handlePointerMove = (e: PointerEvent) => {
        if (isPaused) return;
        const activePaddle = activePointers.current.get(e.pointerId);

        if (activePaddle) {
            const {x, y} = getPos(e.clientX, e.clientY);
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
    };

    const handlePointerUp = (e: PointerEvent) => {
      if(activePointers.current.has(e.pointerId)) {
        activePointers.current.delete(e.pointerId);
        (e.target as HTMLElement)?.releasePointerCapture(e.pointerId);
      }
    };
    
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    return () => {
        canvas.removeEventListener('pointerdown', handlePointerDown);
        canvas.removeEventListener('pointermove', handlePointerMove);
        canvas.removeEventListener('pointerup', handlePointerUp);
        canvas.removeEventListener('pointercancel', handlePointerUp);
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
    <div ref={containerRef} className="w-full h-full flex justify-center items-center" style={{touchAction: 'none'}}>
        <canvas
        ref={canvasRef}
        className="rounded-xl shadow-lg bg-card cursor-none"
        style={{
            boxShadow: `0 0 30px hsla(var(--primary), 0.5), 0 0 30px hsla(var(--accent), 0.5)`,
        }}
        />
    </div>
  );
}
