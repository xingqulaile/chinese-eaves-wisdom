import React, { useState } from 'react';
import SimulationCanvas from './SimulationCanvas';
import { RefreshCw, Trophy, AlertCircle, PlusCircle, RotateCcw, Medal } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface ArchitectModeProps {
  onComplete: () => void;
  leaderboard: LeaderboardEntry[];
  onRecordScore: (entry: LeaderboardEntry) => void;
  onClearLeaderboard: () => void;
}

const ArchitectMode: React.FC<ArchitectModeProps> = ({ 
    onComplete, 
    leaderboard = [], 
    onRecordScore, 
    onClearLeaderboard 
}) => {
  // Free Design Variables
  const [angle, setAngle] = useState(30);
  const [length, setLength] = useState(120);
  const [curvature, setCurvature] = useState(0.5); // 0 to 1
  
  // Metrics
  const [metrics, setMetrics] = useState({rainDistance: 0, shadowDepth: 0});
  
  // Challenge Constants
  const TARGET_LENGTH = 120;
  const LENGTH_TOLERANCE = 2; 

  // Scale metrics for display (approx 250px throw * 4 = 1000cm scale)
  const displayDistance = metrics.rainDistance * 4.0; 

  const isLengthValid = Math.abs(length - TARGET_LENGTH) <= LENGTH_TOLERANCE;

  const handleRecordScore = () => {
      if (!isLengthValid) {
          alert("比赛规则：屋檐长度必须调整为 120 (±2) 才能记录成绩！");
          return;
      }
      
      const score = Math.round(displayDistance);
      if (score <= 0) {
          // Fallback if physics hasn't settled or calc is wrong
          // Usually shouldn't happen with default values, but just in case
          alert("正在计算物理轨迹，请稍等...");
          return;
      }

      const name = window.prompt("🎉 成绩有效！请输入挑战者姓名：", `选手 ${leaderboard.length + 1}`);
      if (!name) return;

      const newEntry: LeaderboardEntry = {
          id: Date.now(),
          name: name.slice(0, 8), // Limit name length
          distance: score,
          angle,
          curvature,
          timestamp: Date.now()
      };

      onRecordScore(newEntry);
      onComplete();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full p-4">
      {/* Canvas Area */}
      <div className="flex-[2] bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex flex-col h-[500px] lg:h-auto relative">
        <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-2">
            <h3 className="text-xl font-bold text-stone-800 flex items-center">
                <span className="bg-[#C83C23] text-white p-1 rounded mr-2">
                    <Trophy size={16}/>
                </span>
                建筑师排位赛
            </h3>
            <div className="flex items-center gap-2">
                 <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center border transition-colors ${isLengthValid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                    {isLengthValid ? '✅ 比赛资格：有效 (长度≈120)' : '⚠️ 比赛资格：无效 (需调整长度至 120)'}
                 </div>
            </div>
        </div>
        
        <div className="flex-1 border-4 border-stone-100 rounded-lg relative overflow-hidden bg-stone-50">
             <SimulationCanvas 
                angle={angle} 
                length={length}
                curvature={curvature}
                isRaining={true}
                sunHeight={45} 
                mode="design"
                onMetricsUpdate={setMetrics}
             />
             
             {/* Current Stats HUD */}
             <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border-2 border-stone-100 w-64 z-10 transition-all">
                <div className="text-xs text-stone-500 mb-1 uppercase tracking-wider">当前雨水抛射距离</div>
                <div className="flex items-baseline mb-4 border-b border-stone-100 pb-4">
                    <span className={`text-4xl font-mono font-bold transition-colors ${isLengthValid ? 'text-[#C83C23]' : 'text-stone-300'}`}>
                        {displayDistance.toFixed(0)}
                    </span>
                    <span className="text-sm ml-1 text-stone-400">cm</span>
                </div>

                <button 
                    onClick={handleRecordScore}
                    disabled={!isLengthValid}
                    className={`w-full py-3 rounded-lg font-bold flex items-center justify-center transition-all shadow-md
                        ${isLengthValid 
                            ? 'bg-[#C83C23] hover:bg-red-800 text-white transform hover:scale-105' 
                            : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
                >
                    <PlusCircle size={18} className="mr-2"/> 记录成绩
                </button>
                
                {!isLengthValid && (
                     <div className="text-center text-[10px] text-orange-500 mt-2">
                         需将屋檐长度调整为 120 才能记录
                     </div>
                )}
             </div>
        </div>
      </div>

      {/* Controls & Leaderboard Area */}
      <div className="flex-1 flex flex-col gap-4 max-w-md h-full">
           {/* Controls */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 shrink-0">
               <h4 className="font-bold text-stone-700 mb-4 flex items-center border-l-4 border-[#C83C23] pl-2">
                   设计参数
               </h4>
               
               <div className="space-y-5">
                   {/* Angle */}
                   <div className="group">
                     <label className="flex justify-between mb-2 text-sm font-medium">
                        <span>起翘角度 (Angle)</span>
                        <span className="text-red-700 font-bold">{angle}°</span>
                     </label>
                     <input 
                        type="range" min="0" max="60" value={angle} 
                        onChange={(e) => setAngle(Number(e.target.value))}
                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-red-700"
                     />
                   </div>

                   {/* Length */}
                   <div className={`group p-2 -mx-2 rounded-lg transition-colors ${!isLengthValid ? 'bg-orange-50' : 'bg-green-50/50'}`}>
                     <div className="flex justify-between mb-2 text-sm font-medium items-center">
                        <span className={!isLengthValid ? "text-orange-700 font-bold" : "text-green-700 font-bold"}>
                            屋檐长度 (Length)
                        </span>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setLength(120)}
                                className="text-[10px] px-2 py-0.5 bg-white hover:bg-stone-100 text-stone-600 rounded flex items-center border border-stone-200 shadow-sm"
                                title="快速重置为 120"
                            >
                                <RotateCcw size={10} className="mr-1"/> 设为 120
                            </button>
                            <span className="text-blue-700 font-bold">{length}</span>
                        </div>
                     </div>
                     <input 
                        type="range" min="80" max="180" value={length} 
                        onChange={(e) => setLength(Number(e.target.value))}
                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
                     />
                     {!isLengthValid && <div className="text-[10px] text-orange-500 mt-1 flex items-center"><AlertCircle size={10} className="mr-1"/> 比赛规定：必须为 120</div>}
                   </div>

                   {/* Curvature */}
                   <div className="group">
                     <label className="flex justify-between mb-2 text-sm font-medium">
                        <span>举折曲度 (Curvature)</span>
                        <span className="text-purple-700 font-bold">{(curvature * 100).toFixed(0)}%</span>
                     </label>
                     <input 
                        type="range" min="0" max="100" value={curvature * 100} 
                        onChange={(e) => setCurvature(Number(e.target.value) / 100)}
                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-purple-700"
                     />
                   </div>
               </div>
           </div>

           {/* Leaderboard - Flex grow to fill remaining space */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 flex flex-col flex-1 min-h-[200px] overflow-hidden">
                <h4 className="font-bold text-stone-700 mb-3 flex items-center justify-between shrink-0">
                   <span className="flex items-center"><Trophy size={16} className="text-yellow-500 mr-2"/> 挑战风云榜</span>
                   <button onClick={onClearLeaderboard} className="text-[10px] text-stone-400 hover:text-[#C83C23] flex items-center px-2 py-1 rounded hover:bg-stone-100">
                       <RefreshCw size={10} className="mr-1"/> 清空
                   </button>
                </h4>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
                    {leaderboard.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300 space-y-2">
                            <Trophy size={48} strokeWidth={1} className="opacity-20"/>
                            <p className="text-xs text-center px-4">暂无成绩<br/>调整参数并点击“记录成绩”上榜！</p>
                        </div>
                    ) : (
                        <div className="space-y-2 pb-2">
                            <div className="grid grid-cols-12 text-[10px] text-stone-400 px-2 pb-1 border-b border-stone-100 sticky top-0 bg-white z-10">
                                <span className="col-span-2">排名</span>
                                <span className="col-span-6">选手</span>
                                <span className="col-span-4 text-right">距离</span>
                            </div>
                            {leaderboard.map((entry, index) => (
                                <div key={entry.id} className={`grid grid-cols-12 items-center p-2 rounded-lg text-sm transition-all animate-fade-in ${index === 0 ? 'bg-yellow-50 border border-yellow-100 shadow-sm' : 'hover:bg-stone-50 border border-transparent'}`}>
                                    <div className="col-span-2 flex items-center">
                                        {index === 0 ? <Medal size={18} className="text-yellow-500"/> : 
                                         index === 1 ? <Medal size={18} className="text-stone-400"/> :
                                         index === 2 ? <Medal size={18} className="text-orange-400"/> :
                                         <span className="w-5 text-center text-stone-400 font-mono font-bold text-xs bg-stone-100 rounded-full h-5 flex items-center justify-center">{index + 1}</span>}
                                    </div>
                                    <div className="col-span-6 font-medium truncate pr-2 flex flex-col" title={entry.name}>
                                        <span className="text-stone-700">{entry.name}</span>
                                        <span className="text-[9px] text-stone-400 font-normal">
                                            ∠{entry.angle}° / 弯{(entry.curvature*100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="col-span-4 text-right font-mono font-bold text-[#C83C23]">
                                        {entry.distance}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
           </div>
      </div>
    </div>
  );
};

export default ArchitectMode;