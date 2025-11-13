export type Paddle = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  lastX: number;
  lastY: number;
  radius: number;
  color: string;
  glow: string;
};

export type Puck = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glow: string;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
};

export type PuckTrail = {
  x: number;
  y: number;
  alpha: number;
};
