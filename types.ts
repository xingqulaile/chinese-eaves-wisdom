export type TabType = 'learn' | 'architect' | 'aesthetics' | 'quiz';

export interface RainParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export interface QuizQuestion {
  id: number;
  type: 'choice' | 'boolean'; 
  question: string;
  options: string[]; 
  correctIndex: number;
  explanation: string;
}

export interface Mistake {
    question: QuizQuestion;
    wrongIndex: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  distance: number;
  angle: number;
  curvature: number;
  timestamp: number;
}

export type ArchitectLevel = {
  id: number;
  title: string;
  description: string;
  targetDescription: string;
  validate: (angle: number, length: number, metrics: {rainDistance: number, shadowDepth: number}) => { passed: boolean, score: number, message: string };
};