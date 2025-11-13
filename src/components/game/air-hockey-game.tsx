'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import type { Paddle, Puck, Particle, PuckTrail } from '@/lib/types';
import type { GameMode, Difficulty } from '@/app/page';

const BASE_CANVAS_WIDTH = 360;
const BASE_CANVAS_HEIGHT = 640;
const PADDLE_RADIUS = 30;
const PUCK_RADIUS = 15;
const GOAL_WIDTH = 120;

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
    x: 0, y: 0, radius: 0,
    color: '#ff0000', glow: '#ff0000',
    vx: 0, vy: 0, lastX: 0, lastY: 0,
  });
  const player2Paddle = useRef<Paddle>({
    id: 'player2',
    x: 0, y: 0, radius: 0,
    color: '#00ff00', glow: '#00ff00',
    vx: 0, vy: 0, lastX: 0, lastY: 0,
  });
  const puck = useRef<Puck>({
    x: 0, y: 0, vx: 0, vy: 0, radius: 0,
    color: '#00ccff', glow: '#00ccff',
  });
  
  const particles = useRef<Particle[]>([]);
  const puckTrail = useRef<PuckTrail[]>([]);

  const activePointers = useRef<Map<number, Paddle>>(new Map());
  const animationFrameId = useRef<number>();

  const resetPuck = useCallback((direction: number) => {
    const { width, height } = canvasSize.current;
    puck.current.x = width / 2;
    puck.current.y = height / 2;
    puck.current.vx = (Math.random() - 0.5) * 5 * scale.current;
    puck.current.vy = direction * (10 * scale.current); // Increased initial speed
    puckTrail.current = [];
  }, [scale]);

  useEffect(() => {
    scores.current = initialScores;
  }, [initialScores]);

  const createParticles = useCallback((x: number, y: number, color: string) => {
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        particles.current.push({
            x,
            y,
            vx: Math.cos(angle) * speed * scale.current,
            vy: Math.sin(angle) * speed * scale.current,
            radius: Math.random() * 2 + 1 * scale.current,
            color,
            life: 30, // 30 frames
        });
    }
  }, [scale]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvasSize.current;
    ctx.clearRect(0, 0, width, height);

    // Draw rink background (optional, could be a texture)
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    // Draw neon borders
    const drawNeonLine = (x1: number, y1: number, x2: number, y2: number, color: string) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 5 * scale.current;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15 * scale.current;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
    };

    const goalWidth = GOAL_WIDTH * scale.current;
    const goalStart = (width - goalWidth) / 2;
    const goalEnd = (width + goalWidth) / 2;

    // Borders
    drawNeonLine(0, 0, 0, height, '#ff0000'); // Left
    drawNeonLine(width, 0, width, height, '#00ff00'); // Right

    // Top goal
    drawNeonLine(0, 0, goalStart, 0, '#ff0000');
    drawNeonLine(goalEnd, 0, width, 0, '#ffff00');
    
    // Bottom goal
    drawNeonLine(0, height, goalStart, height, '#ff0000');
    drawNeonLine(goalEnd, height, width, height, '#0000ff');

    // Center line and circle
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2 * scale.current;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 10 * scale.current;
    ctx.setLineDash([5 * scale.current, 10 * scale.current]);
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    ctx.setLineDash([]);
    ctx.lineWidth = 1 * scale.current;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 60 * scale.current, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();

    // Draw puck trail
    for (let i = 0; i < puckTrail.current.length; i++) {
      const segment = puckTrail.current[i];
      ctx.fillStyle = puck.current.glow;
      ctx.beginPath();
      const radius = puck.current.radius * segment.alpha;
      ctx.arc(segment.x, segment.y, Math.max(0, radius), 0, 2 * Math.PI);
      ctx.globalAlpha = Math.max(0, segment.alpha);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Draw puck
    const drawNeonCircle = (x: number, y: number, radius: number, color: string, glowColor: string, innerColor?: string) => {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 20 * scale.current;
        ctx.strokeStyle = color;
        ctx.lineWidth = 5 * scale.current;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.stroke();

        if (innerColor) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = innerColor;
            ctx.beginPath();
            ctx.arc(x, y, radius - (5*scale.current), 0, 2 * Math.PI);
            ctx.fill();
        } else {
             ctx.fillStyle = glowColor;
             ctx.beginPath();
             ctx.arc(x, y, radius, 0, 2 * Math.PI);
             ctx.fill();
        }
    };
    
    drawNeonCircle(player1Paddle.current.x, player1Paddle.current.y, player1Paddle.current.radius, player1Paddle.current.color, player1Paddle.current.glow, '#fff');
    drawNeonCircle(player2Paddle.current.x, player2Paddle.current.y, player2Paddle.current.radius, player2Paddle.current.color, player2Paddle.current.glow, '#fff');
    drawNeonCircle(puck.current.x, puck.current.y, puck.current.radius, puck.current.color, puck.current.glow);
    ctx.shadowBlur = 0;

    // Draw particles
    particles.current.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
        ctx.globalAlpha = p.life / 30;
        ctx.fill();
    });
    ctx.globalAlpha = 1.0;

  }, [scale, createParticles]);
  
  const updateCanvasSize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
    
    // Adjusted to better fill the space while keeping aspect ratio.
    const aspectRatio = BASE_CANVAS_WIDTH / BASE_CANVAS_HEIGHT;
    let newWidth = containerWidth;
    let newHeight = newWidth / aspectRatio;

    if (newHeight > containerHeight) {
      newHeight = containerHeight;
      newWidth = newHeight * aspectRatio;
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

    // If puck is coming towards the AI
    if (puck.current.y < height / 1.5 && puck.current.vy < 0) {
      // time to intercept
      const timeToIntercept = Math.abs((puck.current.y - paddle.y) / puck.current.vy) * settings.prediction;
      let predictedX = puck.current.x + puck.current.vx * timeToIntercept;

      // Bounce prediction off walls
      if (predictedX < 0) predictedX = -predictedX;
      if (predictedX > width) predictedX = width - (predictedX - width);

      targetX = predictedX;
      // Try to hit back
      targetY = Math.max(puck.current.y - paddle.radius, paddle.radius);

    } else { // Return to default position
      targetX = width / 2;
      targetY = 100 * scale.current;
    }

    targetX = Math.max(paddle.radius, Math.min(width - paddle.radius, targetX));
    targetY = Math.max(paddle.radius, Math.min(height / 2 - paddle.radius, targetY));
  
    paddle.x += (targetX - paddle.x) * settings.speed;
    paddle.y += (targetY - paddle.y) * settings.speed;
  }, [difficulty, scale]);

  const handleCollision = (paddle: Paddle, puck: Puck) => {
    const dx = puck.x - paddle.x;
    const dy = puck.y - paddle.y;
    const distance = Math.hypot(dx, dy);
    const min_dist = paddle.radius + puck.radius;
  
    if (distance < min_dist) {
      createParticles(puck.x, puck.y, paddle.glow);
      
      const angle = Math.atan2(dy, dx);
      
      // 1. Resolve Overlap
      const overlap = min_dist - distance;
      puck.x += Math.cos(angle) * overlap;
      puck.y += Math.sin(angle) * overlap;
      
      // 2. Calculate new velocities
      const paddleVelX = paddle.vx;
      const paddleVelY = paddle.vy;

      // Elastic collision formula
      const normalX = dx / distance;
      const normalY = dy / distance;
      
      const p = 2 * (puck.vx * normalX + puck.vy * normalY - paddleVelX * normalX - paddleVelY * normalY) / 2; // Assuming equal mass
      
      puck.vx -= p * normalX;
      puck.vy -= p * normalY;
      
      // Add a fraction of paddle's velocity for extra power
      puck.vx += paddleVelX * 0.2;
      puck.vy += paddleVelY * 0.2;
  
      // 3. Apply speed boost
      const boost = 1.15;
      puck.vx *= boost;
      puck.vy *= boost;

      // 4. Cap max speed
      const maxSpeed = 30 * scale.current;
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
      draw(); // Keep drawing even when paused
      return;
    }
    
    const { width, height } = canvasSize.current;
    const goalWidth = GOAL_WIDTH * scale.current;
    const goalStart = (width - goalWidth) / 2;
    const goalEnd = (width + goalWidth) / 2;

    const p1 = player1Paddle.current;
    const p2 = player2Paddle.current;

    // Update paddle velocities for collision calculation
    p1.vx = (p1.x - p1.lastX);
    p1.vy = (p1.y - p1.lastY);
    p2.vx = (p2.x - p2.lastX);
    p2.vy = (p2.y - p2.lastY);

    p1.lastX = p1.x;
    p1.lastY = p1.y;
    p2.lastX = p2.x;
    p2.lastY = p2.y;

    if (gameMode === 'pvc') {
      updateAI();
    }

    puck.current.x += puck.current.vx;
    puck.current.y += puck.current.vy;

    const FRICTION = 0.998; // Reduced friction for faster puck
    puck.current.vx *= FRICTION;
    puck.current.vy *= FRICTION;
    
    // Update puck trail
    puckTrail.current.unshift({ x: puck.current.x, y: puck.current.y, alpha: 1 });
    if (puckTrail.current.length > 15) { // Longer trail
      puckTrail.current.pop();
    }
    for (let i = 0; i < puckTrail.current.length; i++) {
      puckTrail.current[i].alpha -= 0.08;
    }

    // Wall bounces
    if (puck.current.x - puck.current.radius < 0) {
      puck.current.x = puck.current.radius;
      puck.current.vx *= -1;
      createParticles(puck.current.x, puck.current.y, '#ff0000');
    }
    if (puck.current.x + puck.current.radius > width) {
      puck.current.x = width - puck.current.radius;
      puck.current.vx *= -1;
      createParticles(puck.current.x, puck.current.y, '#00ff00');
    }

    handleCollision(player1Paddle.current, puck.current);
    handleCollision(player2Paddle.current, puck.current);

    // Goal detection
    const puckRadius = puck.current.radius;
    const inTopGoal = puck.current.y - puckRadius < 0 && puck.current.x > goalStart && puck.current.x < goalEnd;
    const inBottomGoal = puck.current.y + puckRadius > height && puck.current.x > goalStart && puck.current.x < goalEnd;

    if (inTopGoal) {
      scores.current.player1++;
      onScoreChange({ ...scores.current });
      resetPuck(1);
    } else if (inBottomGoal) {
      scores.current.player2++;
      onScoreChange({ ...scores.current });
      resetPuck(-1);
    } else { // Wall bounces if not in goal
       if (puck.current.y - puckRadius < 0) {
            puck.current.y = puckRadius;
            puck.current.vy *= -1;
            createParticles(puck.current.x, puck.current.y, '#ffff00');
        }
        if (puck.current.y + puckRadius > height) {
            puck.current.y = height - puckRadius;
            puck.current.vy *= -1;
             createParticles(puck.current.x, puck.current.y, '#0000ff');
        }
    }
    
    // Update and prune particles
    particles.current = particles.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        return p.life > 0;
    });

    draw();

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [onScoreChange, resetPuck, isPaused, draw, gameMode, updateAI, createParticles]);

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
        
        // Player 1's paddle is always in the bottom half
        if (y > height / 2) {
            paddle = player1Paddle.current;
        } 
        // In PvP mode, Player 2 is in the top half
        else if (gameMode === 'pvp' && y < height / 2) {
            paddle = player2Paddle.current;
        }
        
        if (paddle) {
          activePointers.current.set(e.pointerId, paddle);
          (e.target as HTMLElement)?.setPointerCapture(e.pointerId);
          // Immediately move to start position to feel responsive
          const { width } = canvasSize.current;
          let minY = 0;
          let maxY = height;
          if (paddle.id === 'player1') {
            minY = height / 2;
          } else {
            maxY = height / 2;
          }
          paddle.x = Math.max(paddle.radius, Math.min(width - paddle.radius, x));
          paddle.y = Math.max(minY + paddle.radius, Math.min(maxY - paddle.radius, y));
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
        className="rounded-none cursor-none bg-black"
        />
    </div>
  );
}

    