import React, { useEffect, useRef, useState, useMemo } from 'react';
import { COLORS } from '../constants';

interface SimulationCanvasProps {
  angle: number;
  length?: number; // Eave length in pixels (default 120)
  curvature?: number; // 0 (straight) to 1 (max curve)
  isRaining: boolean;
  sunHeight: number; // 0 to 90 degrees
  showComparison?: boolean; // If true, shows flat eave as ghost
  mode: 'rain' | 'sun' | 'design' | 'bird' | 'front';
  onMetricsUpdate?: (metrics: {rainDistance: number, shadowDepth: number}) => void;
  mini?: boolean; // For quiz thumbnails
}

const SCALE = 1; 
const GRAVITY = 9.8;
const START_X = 100;
const START_Y = 150;
const DEFAULT_LENGTH = 120;
const WALL_HEIGHT = 200;
const FLOOR_Y = 350;

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ 
  angle, 
  length = DEFAULT_LENGTH,
  curvature = 0.5,
  isRaining, 
  sunHeight, 
  showComparison,
  mode,
  onMetricsUpdate,
  mini = false
}) => {
  const requestRef = useRef<number>();
  const [drops, setDrops] = useState<{x: number, y: number, t: number, vx: number, vy: number}[]>([]);
  
  // --- Geometric Calculations ---
  const rad = (angle * Math.PI) / 180;
  
  // Tip Position (End point P2)
  const tipX = START_X + length * Math.cos(rad * 0.8); 
  const tipY = START_Y - length * Math.sin(rad);

  // Control Point Logic
  const maxCurveControlX = START_X + length * 0.3;
  const maxCurveControlY = START_Y + length * 0.3; // Sagging down
  const straightControlX = (START_X + tipX) / 2;
  const straightControlY = (START_Y + tipY) / 2;
  
  const controlX = straightControlX + (maxCurveControlX - straightControlX) * curvature;
  const controlY = straightControlY + (maxCurveControlY - straightControlY) * curvature;

  // --- Physics Calculations ---
  // Rain exit vector
  const tanX = 2 * (tipX - controlX);
  const tanY = 2 * (tipY - controlY);
  const tanMag = Math.sqrt(tanX*tanX + tanY*tanY);
  const dirX = tanX / tanMag;
  const dirY = tanY / tanMag;
  
  // REDUCED VELOCITY: Was 60, now 30
  const v0 = 30; 
  const vx = v0 * dirX;
  const vy = v0 * dirY; 
  
  // --- Trajectory Generation ---
  const trajectoryPoints = useMemo(() => {
    const points = [];
    const totalTime = 4.0; // Increased time since speed is slower
    const timeStep = 0.1;
    
    for (let t = 0; t <= totalTime; t += timeStep) {
      const px = tipX + vx * t * 3;
      const py = tipY + (vy * t * 3) + (0.5 * GRAVITY * t * t * 5); // Reduced gravity visual scale
      
      if (py > FLOOR_Y) break;
      points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return points.join(' ');
  }, [tipX, tipY, vx, vy]);

  // --- Animation Loop ---
  useEffect(() => {
    if (!isRaining) {
      setDrops([]);
      return;
    }

    const animate = () => {
      setDrops(prev => {
        const newDrops = [...prev];
        // REDUCED SPAWN RATE: Was 0.9/0.7, now 0.95/0.85
        const spawnRate = mini ? 0.95 : 0.85; 
        if (Math.random() > spawnRate) {
             newDrops.push({
               x: tipX,
               y: tipY,
               vx: vx * 3, // Visual scaling
               vy: vy * 3,
               t: 0,
               life: 1.0
             });
        }

        return newDrops.map(d => {
          const t = d.t + 0.05;
          const newVy = d.vy + GRAVITY * 5 * 0.05; // Reduced gravity scale for slower rain
          const newX = d.x + d.vx * 0.05;
          const newY = d.y + newVy * 0.05; 

          return {
            ...d,
            x: newX,
            y: newY,
            t: t,
            vx: d.vx,
            vy: newVy
          };
        }).filter(d => d.y < FLOOR_Y + 10);
      });
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isRaining, vx, vy, tipX, tipY, mini]);

  // --- Sunlight Calc ---
  const sunRad = (sunHeight * Math.PI) / 180;
  let lightFloorX = 0;
  if (sunHeight > 0) {
      const tanAlpha = Math.tan(sunRad);
      const dx = (FLOOR_Y - tipY) / tanAlpha;
      lightFloorX = tipX - dx; 
  }

  // --- Metric Updates ---
  useEffect(() => {
      if (onMetricsUpdate) {
          // Physics calc for metric display
          const a = 0.5 * GRAVITY * 5; // Match visual gravity
          const b = vy * 3;
          const c = tipY - FLOOR_Y;
          const delta = b*b - 4*a*c;
          let landingX = tipX;
          if (delta >= 0) {
              const t1 = (-b + Math.sqrt(delta)) / (2*a);
              const t2 = (-b - Math.sqrt(delta)) / (2*a);
              const t = Math.max(t1, t2);
              landingX = tipX + vx * 3 * t;
          }
          
          const rainDist = landingX - START_X;
          const shadowDepth = Math.max(0, START_X - lightFloorX);
          onMetricsUpdate({ rainDistance: rainDist, shadowDepth });
      }
  }, [tipX, tipY, vx, vy, sunHeight, onMetricsUpdate]);

  const RoofPath = `M ${START_X - 20} ${START_Y - 15} 
              Q ${controlX} ${controlY} ${tipX} ${tipY} 
              L ${tipX - 5} ${tipY + 5} 
              Q ${controlX} ${controlY + 10} ${START_X} ${START_Y + 20} 
              Z`;

  // --- Rendering Front View (Aesthetics) ---
  if (mode === 'front') {
    return (
        <div className="w-full h-full flex items-center justify-center bg-transparent">
             <svg viewBox="0 0 400 300" className="w-full h-full">
                <defs>
                   <linearGradient id="inkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2D2D2D" />
                      <stop offset="100%" stopColor="#4A4A4A" />
                   </linearGradient>
                </defs>
                <path d="M 20 280 L 380 280 L 370 260 L 30 260 Z" fill="#E0E0E0" stroke="#2D2D2D" strokeWidth="2" />
                <g stroke="#2D2D2D" strokeWidth="6" strokeLinecap="round">
                    <line x1="60" y1="260" x2="65" y2="180" />
                    <line x1="130" y1="260" x2="130" y2="180" />
                    <line x1="200" y1="260" x2="200" y2="180" />
                    <line x1="270" y1="260" x2="270" y2="180" />
                    <line x1="340" y1="260" x2="335" y2="180" />
                </g>
                <path d="M 50 180 L 350 180 L 360 160 L 40 160 Z" fill="#FFF" stroke="#2D2D2D" strokeWidth="2" />
                <path d="M 40 160 h 320" stroke="#2D2D2D" strokeWidth="4" strokeDasharray="10 20" />
                <path d="M 20 160 Q 100 165 200 165 Q 300 165 380 160 L 395 120 Q 300 140 200 140 Q 100 140 5 120 Z" 
                      fill="none" stroke="#2D2D2D" strokeWidth="3" />
                <path d="M 60 80 L 340 80" stroke="#2D2D2D" strokeWidth="5" />
                <path d="M 60 80 L 5 120" stroke="#2D2D2D" strokeWidth="2" />
                <path d="M 340 80 L 395 120" stroke="#2D2D2D" strokeWidth="2" />
                <path d="M 50 80 Q 40 60 60 50 L 65 75" fill="#2D2D2D" />
                <path d="M 350 80 Q 360 60 340 50 L 335 75" fill="#2D2D2D" />
                <path d="M 80 140 L 90 100 M 120 145 L 125 100 M 320 140 L 310 100" stroke="#2D2D2D" opacity="0.3" />
             </svg>
        </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-white/50 rounded-xl overflow-hidden shadow-inner border border-stone-200 ${mini ? 'p-1' : ''}`}>
      <svg viewBox="0 0 400 400" className="w-full h-full max-w-[500px]">
        <defs>
          <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF3E0" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={COLORS.vermilion} />
          </marker>
        </defs>

        {!mini && <rect x="0" y="0" width="400" height="350" fill="url(#skyGradient)" />}

        <line x1="0" y1={FLOOR_Y} x2="400" y2={FLOOR_Y} stroke={COLORS.ink} strokeWidth="2" />
        {!mini && <text x="10" y={FLOOR_Y + 20} fontSize="12" fill={COLORS.ink} opacity="0.6">地面 (Ground)</text>}

        {showComparison && mode !== 'bird' && !mini && (
          <g opacity="0.3">
             <path d={`M ${START_X} ${START_Y + 10} L ${START_X + length} ${START_Y} L ${START_X} ${START_Y - 10}`} fill="none" stroke={COLORS.ink} strokeDasharray="4 4"/>
          </g>
        )}

        {/* --- SUNLIGHT LAYER (BACK) --- */}
        {(mode === 'sun' || mode === 'design') && sunHeight > 0 && (
          <>
             <path 
              d={`M ${tipX} ${tipY} L ${lightFloorX} ${FLOOR_Y} L 400 ${FLOOR_Y} L 400 ${tipY} Z`} 
              fill={COLORS.warmSun} 
              opacity="0.3" 
            />
            <line x1={tipX} y1={tipY} x2={lightFloorX} y2={FLOOR_Y} stroke={COLORS.warmSun} strokeWidth="1" strokeDasharray="2 2" />
            {!mini && (
                <g transform={`rotate(${-sunHeight + 90}, 200, 350) translate(0, -300)`}>
                <g transform={`rotate(${sunHeight - 90})`}> 
                    <circle r="25" fill={COLORS.warmSun} opacity="0.9" filter="blur(2px)"/>
                    <circle r="15" fill="#FFF" opacity="0.3" />
                </g>
                </g>
            )}
          </>
        )}

        {/* --- MASKING LAYER (BLOCKS SUN) --- */}
        {/* REDUCED MASK THICKNESS: Width 30 instead of 60, adjusted x position */}
        <path d={RoofPath} fill="#F7F5F0" stroke="none" /> 
        <rect x={START_X - 25} y={START_Y} width={30} height={WALL_HEIGHT} fill="#F7F5F0" stroke="none"/>

        {/* --- BUILDING STRUCTURE (FRONT) --- */}
        <rect x={START_X - 10} y={START_Y} width="10" height={WALL_HEIGHT} fill="#5D4037" />
        <path 
          d={RoofPath} 
          fill={COLORS.vermilion} 
          stroke={COLORS.ink} 
          strokeWidth="2"
        />
        <circle cx={tipX} cy={tipY} r="3" fill={COLORS.gold} />

        {/* --- DIMENSION LABELS (DESIGN MODE) --- */}
        {mode === 'design' && (
            <g>
                {/* Column Height */}
                <line x1={START_X - 25} y1={START_Y} x2={START_X - 25} y2={START_Y + WALL_HEIGHT} stroke={COLORS.ink} strokeWidth="1" />
                <line x1={START_X - 28} y1={START_Y} x2={START_X - 22} y2={START_Y} stroke={COLORS.ink} strokeWidth="1" />
                <line x1={START_X - 28} y1={START_Y + WALL_HEIGHT} x2={START_X - 22} y2={START_Y + WALL_HEIGHT} stroke={COLORS.ink} strokeWidth="1" />
                <text x={START_X - 35} y={START_Y + WALL_HEIGHT / 2} fontSize="10" textAnchor="end" dominantBaseline="middle" fill={COLORS.ink}>H</text>
                
                {/* Eave Length */}
                <path d={`M ${START_X} ${START_Y - 30} L ${tipX} ${tipY - 30}`} stroke={COLORS.ink} strokeWidth="1" />
                <line x1={START_X} y1={START_Y - 25} x2={START_X} y2={START_Y - 35} stroke={COLORS.ink} strokeWidth="1" />
                <line x1={tipX} y1={tipY - 25} x2={tipX} y2={tipY - 35} stroke={COLORS.ink} strokeWidth="1" />
                <text x={(START_X + tipX) / 2} y={START_Y - 35} fontSize="10" textAnchor="middle" fill={COLORS.ink}>Length</text>

                {/* Ground Projection */}
                <line x1={START_X} y1={FLOOR_Y + 10} x2={tipX} y2={FLOOR_Y + 10} stroke={COLORS.ink} strokeWidth="1" strokeDasharray="2 2" />
                <text x={(START_X + tipX) / 2} y={FLOOR_Y + 22} fontSize="10" textAnchor="middle" fill={COLORS.ink}>W (Projection)</text>
                
                {/* Angle */}
                <path d={`M ${START_X + 40} ${START_Y} A 40 40 0 0 0 ${START_X + 40 * Math.cos(rad)} ${START_Y - 40 * Math.sin(rad)}`} fill="none" stroke={COLORS.vermilion} strokeWidth="1" strokeDasharray="2 2"/>
                <text x={START_X + 50} y={START_Y - 10} fontSize="10" fill={COLORS.vermilion}>α</text>
            </g>
        )}

        {/* --- RAIN LAYER (FRONT) --- */}
        {(mode === 'rain' || mode === 'design') && (
          <>
            <polyline 
                points={trajectoryPoints} 
                fill="none" 
                stroke={COLORS.rainBlue} 
                strokeWidth="1.5" 
                opacity="0.6"
            />
            {trajectoryPoints.length > 0 && (
                 <circle cx={trajectoryPoints.split(' ').pop()?.split(',')[0]} cy={FLOOR_Y} r="3" fill={COLORS.rainBlue} />
            )}
            
            {drops.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r="2" fill={COLORS.rainBlue} opacity={d.life} />
            ))}
          </>
        )}
      </svg>
    </div>
  );
};

export default SimulationCanvas;