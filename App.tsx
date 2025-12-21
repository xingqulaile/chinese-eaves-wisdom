import React, { useState, useEffect } from 'react';
import { BookOpen, CloudRain, Sun, PenTool, Feather, Award, ChevronRight, Volume2, VolumeX, CheckCircle, ThumbsUp, ThumbsDown, RotateCcw, AlertCircle, BookX, ArrowLeft } from 'lucide-react';
import { COLORS, QUESTION_POOL, ACHIEVEMENTS } from './constants';
import { TabType, Achievement, QuizQuestion, LeaderboardEntry, Mistake } from './types';
import SimulationCanvas from './components/SimulationCanvas';
import ArchitectMode from './components/ArchitectMode';

// Simple Confetti Component
const Confetti = () => {
    const [particles, setParticles] = useState<{id: number, x: number, y: number, color: string, speed: number, wobble: number}[]>([]);
    
    useEffect(() => {
        const colors = ['#C83C23', '#E0B25D', '#4A90E2', '#7A9D96', '#FFD700'];
        const p = Array.from({length: 100}).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: -20 - Math.random() * 50,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: 0.8 + Math.random() * 1.5,
            wobble: Math.random() * 10
        }));
        setParticles(p);

        const interval = setInterval(() => {
            setParticles(prev => prev.map(p => ({
                ...p,
                y: p.y > 110 ? -10 : p.y + p.speed,
                x: p.x + Math.sin(p.y/10 + p.wobble) * 1.5,
                wobble: p.wobble + 0.1
            })));
        }, 30);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {particles.map(p => (
                <div key={p.id} 
                    style={{
                        position: 'absolute', 
                        left: `${p.x}%`, 
                        top: `${p.y}%`, 
                        backgroundColor: p.color,
                        width: '8px', height: '8px', 
                        borderRadius: '50%',
                        transform: `rotate(${p.y * 10}deg)`,
                        opacity: 0.8
                    }} 
                />
            ))}
        </div>
    );
};

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('learn');
  const [angle, setAngle] = useState(30);
  const [isRaining, setIsRaining] = useState(false);
  const [sunHeight, setSunHeight] = useState(50); // Centered default
  const [myAchievements, setMyAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  
  // Leaderboard State with LocalStorage Persistence
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
      try {
          const saved = localStorage.getItem('architect_leaderboard');
          const parsed = saved ? JSON.parse(saved) : [];
          return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
          console.error("Failed to load leaderboard", e);
          return [];
      }
  });

  // Save leaderboard whenever it changes
  useEffect(() => {
      try {
        localStorage.setItem('architect_leaderboard', JSON.stringify(leaderboard));
      } catch (e) {
        console.error("Failed to save leaderboard", e);
      }
  }, [leaderboard]);
  
  // Quiz State
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);
  
  // Mistake Notebook State
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [isReviewingMistakes, setIsReviewingMistakes] = useState(false);
  
  const [learnMode, setLearnMode] = useState<'rain' | 'sun'>('rain');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Initialize Quiz on Load
  useEffect(() => {
     startNewQuiz();
  }, []);

  const startNewQuiz = () => {
      // Shuffle correctly and pick 5 unique questions from the larger pool
      const shuffled = [...QUESTION_POOL].sort(() => 0.5 - Math.random());
      setActiveQuestions(shuffled.slice(0, 5));
      setCurrentQuizIndex(0);
      setQuizScore(0);
      setShowQuizResult(false);
      setMistakes([]); // Clear mistakes for new game
      setIsReviewingMistakes(false);
  };

  const handleRecordScore = (entry: LeaderboardEntry) => {
    setLeaderboard(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const newList = [...safePrev, entry].sort((a, b) => b.distance - a.distance);
        return newList.slice(0, 50); // Keep top 50
    });
  };

  const handleClearLeaderboard = () => {
      if(window.confirm("确定要清空排行榜吗？")) {
          setLeaderboard([]);
      }
  };

  // Audio Effects
  const playTone = (type: 'correct' | 'wrong' | 'win' | 'click') => {
    if (!soundEnabled) return;
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const now = ctx.currentTime;

        if (type === 'correct') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(); osc.stop(now + 0.3);
        } else if (type === 'wrong') {
             osc.type = 'triangle';
             osc.frequency.setValueAtTime(300, now);
             osc.frequency.linearRampToValueAtTime(200, now + 0.3);
             gain.gain.setValueAtTime(0.1, now);
             gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
             osc.start(); osc.stop(now + 0.3);
        } else if (type === 'win') {
             const notes = [523.25, 659.25, 783.99, 1046.50];
             notes.forEach((freq, i) => {
                 const oscN = ctx.createOscillator();
                 const gainN = ctx.createGain();
                 oscN.connect(gainN);
                 gainN.connect(ctx.destination);
                 oscN.type = 'sine';
                 oscN.frequency.value = freq;
                 gainN.gain.setValueAtTime(0.1, now + i*0.1);
                 gainN.gain.exponentialRampToValueAtTime(0.001, now + i*0.1 + 0.5);
                 oscN.start(now + i*0.1);
                 oscN.stop(now + i*0.1 + 0.5);
             });
        }
    } catch (e) { console.error(e); }
  };

  const unlockAchievement = (id: string) => {
    setMyAchievements(prev => {
        const target = prev.find(a => a.id === id);
        if (target && !target.unlocked) {
            return prev.map(a => a.id === id ? { ...a, unlocked: true } : a);
        }
        return prev;
    });
  };

  const handleQuizAnswer = (isCorrect: boolean, idx?: number) => {
    const currentQ = activeQuestions[currentQuizIndex];
    
    if (isCorrect) {
        playTone('correct');
        setQuizScore(s => s + 1);
        if (idx !== undefined) {
            const btn = document.getElementById(`opt-${idx}`);
            if(btn) btn.classList.add('bg-green-100', 'border-green-500');
        }
    } else {
        playTone('wrong');
        if (idx !== undefined) {
            const btn = document.getElementById(`opt-${idx}`);
            if(btn) {
                btn.classList.add('bg-red-100', 'animate-shake');
                setTimeout(() => btn.classList.remove('bg-red-100', 'animate-shake'), 500);
            }
            // Add to mistakes
            setMistakes(prev => [...prev, { question: currentQ, wrongIndex: idx }]);
        }
    }

    setTimeout(() => {
        const btns = document.querySelectorAll('[id^="opt-"]');
        btns.forEach(b => b.classList.remove('bg-green-100', 'border-green-500', 'bg-red-100'));

        if (currentQuizIndex < activeQuestions.length - 1) {
            setCurrentQuizIndex(c => c + 1);
        } else {
            setShowQuizResult(true);
            if (quizScore + (isCorrect ? 1 : 0) === activeQuestions.length) {
                 playTone('win');
                 unlockAchievement('scholar');
            }
        }
    }, 1000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'learn':
        return (
          <div className="flex flex-col lg:flex-row gap-6 h-full overflow-y-auto p-4">
            <div className="lg:w-2/3 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                 <h2 className="text-xl font-bold text-stone-800 flex items-center">
                    {learnMode === 'rain' ? <CloudRain className="mr-2 text-blue-500"/> : <Sun className="mr-2 text-orange-500"/>}
                    {learnMode === 'rain' ? '排水模拟 (Drainage)' : '采光模拟 (Lighting)'}
                 </h2>
                 <div className="flex bg-stone-200 rounded-lg p-1 text-sm">
                    <button onClick={() => setLearnMode('rain')} className={`px-3 py-1 rounded-md transition ${learnMode === 'rain' ? 'bg-white shadow text-blue-600' : 'text-stone-500'}`}>雨水</button>
                    <button onClick={() => setLearnMode('sun')} className={`px-3 py-1 rounded-md transition ${learnMode === 'sun' ? 'bg-white shadow text-orange-600' : 'text-stone-500'}`}>阳光</button>
                 </div>
              </div>
              <div className="flex-1 relative min-h-[350px]">
                 <SimulationCanvas angle={angle} isRaining={isRaining} sunHeight={sunHeight} mode={learnMode} showComparison={true}/>
                 <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg shadow border border-stone-100 text-xs space-y-1">
                    <div className="font-bold text-stone-500 mb-1">物理参数</div>
                    <div className="flex justify-between w-32"><span>角度:</span><span className="font-mono font-bold text-red-700">{angle}°</span></div>
                    {learnMode === 'sun' && <div className="flex justify-between w-32"><span>太阳高度:</span><span className="font-mono">{sunHeight}°</span></div>}
                 </div>
              </div>
            </div>
            <div className="lg:w-1/3 flex flex-col gap-4">
               <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200">
                  <h3 className="font-bold text-stone-700 mb-4 border-l-4 border-[#C83C23] pl-2">参数调节</h3>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-stone-600 mb-2">屋檐翘起角度</label>
                    <input type="range" min="0" max="45" value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#C83C23]"/>
                  </div>
                  {learnMode === 'rain' ? (
                     <button onClick={() => setIsRaining(!isRaining)} className={`w-full py-3 rounded-lg flex items-center justify-center font-bold transition-all ${isRaining ? 'bg-blue-100 text-blue-700' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'}`}>
                        <CloudRain className="mr-2 w-5 h-5" />{isRaining ? '停止' : '开始模拟'}
                     </button>
                  ) : (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-stone-600 mb-2">季节 (太阳高度)</label>
                        <input type="range" min="35" max="65" value={sunHeight} onChange={(e) => setSunHeight(Number(e.target.value))} className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-orange-500"/>
                        <div className="flex justify-between text-xs text-stone-400 mt-1"><span>冬 (低)</span><span>夏 (高)</span></div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        );

      case 'architect':
        return (
            <ArchitectMode 
                onComplete={() => unlockAchievement('architect')} 
                leaderboard={leaderboard}
                onRecordScore={handleRecordScore}
                onClearLeaderboard={handleClearLeaderboard}
            />
        );

      case 'aesthetics':
        return (
            <div className="h-full p-6 flex flex-col items-center justify-center overflow-y-auto bg-gradient-to-b from-[#F7F5F0] to-[#EFEBE4]">
                <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg border border-stone-200 p-8 flex flex-col items-center">
                    
                    {/* 1. TITLE SECTION */}
                    <div className="text-center mb-8 w-full">
                         <div className="w-full flex justify-center mb-6">
                             {/* The requested Text - Made Huge and Prominent */}
                             <div className="relative">
                                 <h1 className="text-5xl md:text-6xl font-serif font-black text-[#C83C23] tracking-widest leading-tight z-10 relative drop-shadow-sm select-none">
                                     如鸟斯革<br/>如翚斯飞
                                 </h1>
                                 <div className="absolute -top-4 -left-4 w-12 h-12 border-t-4 border-l-4 border-stone-200 rounded-tl-xl"></div>
                                 <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-4 border-r-4 border-stone-200 rounded-br-xl"></div>
                             </div>
                         </div>
                         <p className="text-stone-500 font-serif italic text-lg">——《诗经·小雅·斯干》</p>
                    </div>

                    {/* 2. IMAGE SECTION */}
                    <div className="relative w-full max-w-lg mb-10 group flex justify-center">
                        <div className="absolute inset-0 bg-[#C83C23]/5 rounded-full blur-3xl group-hover:bg-[#C83C23]/10 transition-colors duration-700"></div>
                        <img 
                            src="https://r2work.bohubs.com/image/souxihufeiyan.png" 
                            alt="Pheasant Flying Illustration" 
                            className="relative z-10 w-full h-auto max-h-[300px] object-contain drop-shadow-2xl transform transition-transform duration-700 hover:scale-105"
                        />
                    </div>

                    {/* 3. EXPLANATION SECTION */}
                    <div className="max-w-3xl space-y-6 text-stone-700 leading-loose text-justify font-sans bg-stone-50/50 p-6 rounded-xl border border-stone-100">
                        <p className="text-lg text-center font-medium text-stone-800">
                            古人建造房屋，不仅仅是为了遮风避雨，更寄托了对自然的崇敬与模仿。
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-6 my-4">
                            <div className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm hover:border-[#C83C23]/30 transition-colors hover:shadow-md">
                                <h3 className="text-[#C83C23] font-bold text-2xl mb-2 font-serif border-b border-stone-100 pb-2">革 (gé)</h3>
                                <p className="text-sm text-stone-600">
                                    形容大鸟张开翅膀的瞬间，羽翼强劲有力，充满张力。如同屋顶的坡度，沉稳而舒展。
                                </p>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm hover:border-[#C83C23]/30 transition-colors hover:shadow-md">
                                <h3 className="text-[#C83C23] font-bold text-2xl mb-2 font-serif border-b border-stone-100 pb-2">翚 (huī)</h3>
                                <p className="text-sm text-stone-600">
                                    指五彩斑斓的锦鸡。当它展翅高飞时，色彩绚丽，姿态轻盈。如同屋檐翘起的翼角，灵动而飘逸。
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 w-full text-center">
                         <button 
                            onClick={() => {
                                unlockAchievement('aesthete');
                            }}
                            className="px-8 py-3 bg-[#C83C23] hover:bg-red-800 text-white rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center mx-auto"
                         >
                            <CheckCircle size={18} className="mr-2" /> 我已领悟东方美学意境
                         </button>
                    </div>
                </div>
            </div>
        );

      case 'quiz':
        // REVIEW MISTAKES VIEW
        if (showQuizResult && isReviewingMistakes) {
            return (
                <div className="max-w-2xl mx-auto p-4 flex flex-col h-full relative overflow-y-auto">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-stone-100 mb-4">
                        <button 
                            onClick={() => setIsReviewingMistakes(false)}
                            className="flex items-center text-stone-500 hover:text-[#C83C23] mb-4 font-bold transition-colors"
                        >
                            <ArrowLeft size={20} className="mr-2"/> 返回成绩单
                        </button>
                        <h2 className="text-2xl font-bold text-[#C83C23] mb-6 flex items-center">
                            <BookX className="mr-2" /> 错题本 ({mistakes.length})
                        </h2>
                        
                        <div className="space-y-6">
                            {mistakes.map((m, idx) => (
                                <div key={idx} className="bg-stone-50 p-5 rounded-xl border-l-4 border-red-400">
                                    <h3 className="font-bold text-stone-800 mb-3 text-lg">{m.question.question}</h3>
                                    
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-red-600 text-sm">
                                            <span className="w-20 font-bold shrink-0">你的选择:</span>
                                            <span className="bg-red-50 px-2 py-1 rounded border border-red-100 line-through decoration-red-400">
                                                {m.question.options[m.wrongIndex]}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-green-700 text-sm">
                                            <span className="w-20 font-bold shrink-0">正确答案:</span>
                                            <span className="bg-green-50 px-2 py-1 rounded border border-green-100 font-bold">
                                                {m.question.options[m.question.correctIndex]}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="text-sm text-stone-600 bg-white p-3 rounded-lg border border-stone-100">
                                        <span className="font-bold text-stone-400 mr-2">解析:</span>
                                        {m.question.explanation}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        // QUIZ RESULT VIEW
        if (showQuizResult) {
             return (
                <div className="max-w-2xl mx-auto p-4 flex flex-col items-center justify-center h-full relative">
                    <div className="relative text-center bg-white p-10 rounded-2xl shadow-xl animate-fade-in w-full max-w-md overflow-hidden">
                        <Confetti />
                        <div className="relative z-10">
                            <div className="text-6xl mb-4 animate-bounce">🏆</div>
                            <h2 className="text-3xl font-bold text-[#C83C23] mb-2">
                                {quizScore === activeQuestions.length ? "太棒了！" : "挑战完成！"}
                            </h2>
                            <div className="text-stone-500 mb-6">
                                总得分：<span className="text-2xl font-bold text-stone-800">{quizScore}</span> / {activeQuestions.length}
                            </div>
                            
                            <p className="text-sm text-stone-600 mb-8 bg-stone-50 p-4 rounded-lg">
                                {quizScore === activeQuestions.length 
                                    ? "完美通关！你已经完全掌握了中国古建翘檐的智慧！" 
                                    : "表现不错！温故而知新，看看哪里做错了？"}
                            </p>
                            
                            <div className="flex flex-col gap-3">
                                {mistakes.length > 0 && (
                                    <button 
                                        onClick={() => setIsReviewingMistakes(true)}
                                        className="bg-white border-2 border-orange-100 text-orange-600 px-8 py-3 rounded-full hover:bg-orange-50 transition-all font-bold flex items-center justify-center"
                                    >
                                        <BookX size={18} className="mr-2"/> 查看错题本 ({mistakes.length})
                                    </button>
                                )}
                                <button 
                                    onClick={startNewQuiz}
                                    className="bg-[#C83C23] text-white px-8 py-3 rounded-full hover:bg-red-800 shadow-lg shadow-red-200 transition-transform hover:scale-105 font-bold flex items-center justify-center"
                                >
                                    <RotateCcw size={18} className="mr-2"/> 再玩一次 (新题目)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
             );
        }

        // QUIZ PLAYING VIEW
        const currentQ = activeQuestions[currentQuizIndex];
        return (
            <div className="max-w-2xl mx-auto p-4 flex flex-col items-center justify-center h-full relative">
                 <div className="bg-white w-full p-8 rounded-2xl shadow-lg border border-stone-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                        <div className="h-full bg-[#C83C23] transition-all duration-500" style={{width: `${((currentQuizIndex)/activeQuestions.length)*100}%`}}></div>
                    </div>
                    <div className="flex justify-between items-center mb-6 mt-2">
                        <span className="text-stone-400 font-bold tracking-widest">QUESTION {currentQuizIndex + 1}</span>
                        <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-stone-400 hover:text-stone-600">
                            {soundEnabled ? <Volume2 size={16}/> : <VolumeX size={16}/>}
                        </button>
                    </div>
                    
                    <h2 className="text-xl font-bold text-stone-800 mb-8 min-h-[3.5rem] flex items-center">{currentQ.question}</h2>
                    
                    {currentQ.type === 'boolean' ? (
                            <div className="grid grid-cols-2 gap-4">
                            {currentQ.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    id={`opt-${idx}`}
                                    onClick={() => handleQuizAnswer(idx === currentQ.correctIndex, idx)}
                                    className="h-32 rounded-xl border-2 border-stone-100 hover:border-[#C83C23]/20 hover:bg-stone-50 transition-all flex flex-col items-center justify-center gap-2 group active:scale-95"
                                >
                                    {idx === 0 ? <ThumbsUp size={32} className="text-stone-400 group-hover:text-green-500"/> : <ThumbsDown size={32} className="text-stone-400 group-hover:text-red-500"/>}
                                    <span className="text-lg font-bold text-stone-600">{opt}</span>
                                </button>
                            ))}
                            </div>
                    ) : (
                        <div className="space-y-3">
                            {currentQ.options?.map((opt, idx) => (
                                <button
                                    key={idx}
                                    id={`opt-${idx}`}
                                    onClick={() => handleQuizAnswer(idx === currentQ.correctIndex, idx)}
                                    className="w-full text-left p-4 rounded-xl border border-stone-200 hover:bg-stone-50 transition-all flex justify-between group active:scale-[0.98]"
                                >
                                    <span className="text-stone-700 font-medium">{opt}</span>
                                    <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400"/>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-full bg-[#F7F5F0] flex flex-col text-[#2D2D2D] font-sans">
      <header className="bg-white border-b border-stone-200 h-16 flex items-center justify-between px-4 lg:px-8 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C83C23] rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl shadow-md">
                檐
            </div>
            <h1 className="text-lg lg:text-xl font-bold tracking-wide">中国古建：翘檐智慧</h1>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-stone-100 px-3 py-1 rounded-full cursor-help group relative">
            <Award className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-stone-600">
                {myAchievements.filter(a => a.unlocked).length} / 3 徽章
            </span>
            <div className="absolute top-full right-0 mt-2 w-64 bg-white shadow-xl rounded-xl p-3 hidden group-hover:block border border-stone-200 z-50">
                <h4 className="text-xs font-bold text-stone-400 mb-2 uppercase">成就列表</h4>
                <div className="space-y-2">
                    {myAchievements.map(a => (
                        <div key={a.id} className={`flex items-center gap-2 p-2 rounded-lg ${a.unlocked ? 'bg-orange-50 border border-orange-100' : 'bg-stone-50 opacity-50'}`}>
                            <span className="text-lg">{a.icon}</span>
                            <div>
                                <div className="text-xs font-bold">{a.name}</div>
                                <div className="text-[10px] text-stone-500">{a.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {renderContent()}
      </main>

      <nav className="bg-white border-t border-stone-200 h-16 md:h-20 flex justify-around items-center px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20 shrink-0">
        <NavButton active={activeTab === 'learn'} onClick={() => setActiveTab('learn')} icon={<BookOpen size={20} />} label="探究原理" />
        <NavButton active={activeTab === 'architect'} onClick={() => setActiveTab('architect')} icon={<PenTool size={20} />} label="建筑师挑战" />
        <NavButton active={activeTab === 'aesthetics'} onClick={() => setActiveTab('aesthetics')} icon={<Feather size={20} />} label="美学鉴赏" />
        <NavButton active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} icon={<Award size={20} />} label="趣味问答" />
      </nav>
      
      <style>{`
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        .animate-shake {
            animation: shake 0.3s ease-in-out;
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        /* Custom Scrollbar for Leaderboard */
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #ddd; 
            border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #ccc; 
        }
      `}</style>
    </div>
  );
}

const NavButton: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({ active, onClick, icon, label }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${active ? 'text-[#C83C23]' : 'text-stone-400 hover:text-stone-600'}`}>
        <div className={`p-1.5 rounded-full transition-all ${active ? 'bg-red-50 transform scale-110' : ''}`}>{icon}</div>
        <span className={`text-[10px] md:text-xs font-medium ${active ? 'font-bold' : ''}`}>{label}</span>
    </button>
);

export default App;
