import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';

interface WatchBreathingExerciseProps {
  stressWord: string;
  onCompleted: () => void;
  onBack: () => void;
}

type Phase = 'ready' | 'inhale' | 'hold' | 'exhale' | 'exhale-pause' | 'complete';

interface BreathingTechnique {
  id: string;
  name: string;
  description: string;
  shortName: string;
  emoji: string;
  phases: {
    inhale: number;    // seconds
    hold?: number;     // seconds (optional)
    exhale: number;    // seconds  
    exhaleHold?: number; // seconds (optional, for box breathing)
  };
  cycles: number;
  duration: string;
  visualization: 'circle' | 'light';
  vibration: {
    inhaleStart: 'short' | 'long' | 'none';
    exhaleStart: 'short' | 'long' | 'none';
    holdStart?: 'short' | 'long' | 'none';
    pauseStart?: 'short' | 'long' | 'none';
  };
}

export const WatchBreathingExercise: React.FC<WatchBreathingExerciseProps> = ({ 
  stressWord, 
  onCompleted,
  onBack 
}) => {
  const [phase, setPhase] = useState<Phase>('ready');
  const [cycle, setCycle] = useState(0);
  const [initialHRV, setInitialHRV] = useState(0);
  const [finalHRV, setFinalHRV] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [technique, setTechnique] = useState<BreathingTechnique | null>(null);

  // Define breathing techniques with Watch-specific features
  const breathingTechniques: BreathingTechnique[] = [
    {
      id: 'coherent',
      name: 'Coherent Breathing',
      description: '6 breaths per minute for optimal heart rate variability',
      shortName: 'Coherent',
      emoji: '🫁',
      phases: { inhale: 5, exhale: 5 },
      cycles: 6, // 5 minutes worth
      duration: '5 min',
      visualization: 'circle',
      vibration: {
        inhaleStart: 'short',
        exhaleStart: 'short'
      }
    },
    {
      id: 'exhalation',
      name: 'Exhalation Emphasis',
      description: 'Extended exhale for rapid relaxation activation',
      shortName: 'Extended Exhale',
      emoji: '🌊',
      phases: { inhale: 4, exhale: 8 },
      cycles: 8, // ~6 minutes worth
      duration: '6 min',
      visualization: 'light',
      vibration: {
        inhaleStart: 'short',
        exhaleStart: 'none' // Let user naturally extend
      }
    },
    {
      id: 'rhythm',
      name: 'Rhythm Breathing',
      description: 'Four equal phases in circular rhythm for deep relaxation',
      shortName: 'Rhythm Breathing',
      emoji: '🔵',
      phases: { inhale: 4, hold: 4, exhale: 4, exhaleHold: 4 },
      cycles: 6, // ~6 minutes worth
      duration: '6 min',
      visualization: 'circle',
      vibration: {
        inhaleStart: 'short',
        holdStart: 'none',
        exhaleStart: 'long',
        pauseStart: 'none'
      }
    }
  ];

  // Randomly select technique on component mount
  useEffect(() => {
    const randomTechnique = breathingTechniques[Math.floor(Math.random() * breathingTechniques.length)];
    setTechnique(randomTechnique);
  }, []);

  // Dynamic phase timings based on selected technique
  const getPhaseTimings = () => {
    if (!technique) return { inhale: 4000, hold: 7000, exhale: 8000 };
    
    return {
      inhale: technique.phases.inhale * 1000,
      hold: (technique.phases.hold || 0) * 1000,
      exhale: technique.phases.exhale * 1000,
      'exhale-pause': (technique.phases.exhaleHold || 0) * 1000
    };
  };

  const phaseTimings = getPhaseTimings();
  const totalCycles = technique?.cycles || 3;

  // Generate mock HRV values
  useEffect(() => {
    if (phase === 'ready') {
      const baseHRV = 35 + Math.random() * 15; // 35-50 range
      setInitialHRV(Math.round(baseHRV));
      setFinalHRV(Math.round(baseHRV + 8 + Math.random() * 7)); // +8-15 improvement
    }
  }, [phase]);

  // Countdown timer effect
  useEffect(() => {
    if (phase === 'ready' || phase === 'complete' || !technique) return;
    
    const phaseLength = phaseTimings[phase] / 1000; // Convert to seconds
    setCountdown(phaseLength);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [phase, technique]);

  useEffect(() => {
    if (phase === 'ready' || !technique) return;

    let timer: NodeJS.Timeout;
    
    switch (phase) {
      case 'inhale':
        timer = setTimeout(() => {
          if (technique.phases.hold && technique.phases.hold > 0) {
            setPhase('hold');
          } else {
            setPhase('exhale');
          }
        }, phaseTimings.inhale);
        break;
        
      case 'hold':
        timer = setTimeout(() => {
          setPhase('exhale');
        }, phaseTimings.hold);
        break;
        
      case 'exhale':
        timer = setTimeout(() => {
          if (technique.phases.exhaleHold && technique.phases.exhaleHold > 0) {
            setPhase('exhale-pause');
          } else {
            const nextCycle = cycle + 1;
            setCycle(nextCycle);
            
            if (nextCycle >= totalCycles) {
              setPhase('complete');
            } else {
              setPhase('inhale');
            }
          }
        }, phaseTimings.exhale);
        break;
        
      case 'exhale-pause':
        timer = setTimeout(() => {
          const nextCycle = cycle + 1;
          setCycle(nextCycle);
          
          if (nextCycle >= totalCycles) {
            setPhase('complete');
          } else {
            setPhase('inhale');
          }
        }, phaseTimings['exhale-pause']);
        break;
    }

    return () => clearTimeout(timer);
  }, [phase, cycle, technique]);

  const startExercise = () => {
    setPhase('inhale');
    setCycle(0);
  };

  // Get breathing animation values based on technique and phase - optimized for watch screen
  const getBreathingValues = () => {
    if (!technique) {
      return { scale: 1, innerScale: 1, glow: 15, opacity: 0.8, duration: 1, particleDirection: 'none' };
    }

    const baseValues = {
      inhale: {
        scale: technique.visualization === 'circle' ? 1.4 : technique.visualization === 'light' ? 1.2 : 1.3,
        innerScale: technique.visualization === 'circle' ? 1.6 : technique.visualization === 'light' ? 1.4 : 1.5,
        glow: 20,
        opacity: 1,
        duration: technique.phases.inhale,
        particleDirection: 'inward'
      },
      hold: {
        scale: technique.visualization === 'circle' ? 1.4 : technique.visualization === 'light' ? 1.2 : 1.3,
        innerScale: technique.visualization === 'circle' ? 1.6 : technique.visualization === 'light' ? 1.4 : 1.5,
        glow: 35,
        opacity: 1,
        duration: 1,
        particleDirection: 'hold'
      },
      exhale: {
        scale: technique.visualization === 'circle' ? 0.8 : technique.visualization === 'light' ? 0.6 : 0.7,
        innerScale: technique.visualization === 'circle' ? 0.5 : technique.visualization === 'light' ? 0.3 : 0.4,
        glow: technique.visualization === 'light' ? 15 : 12,
        opacity: technique.visualization === 'light' ? 1 : 0.9,
        duration: technique.phases.exhale,
        particleDirection: 'outward'
      },
      'exhale-pause': {
        scale: technique.visualization === 'circle' ? 0.8 : technique.visualization === 'light' ? 0.6 : 0.7,
        innerScale: technique.visualization === 'circle' ? 0.5 : technique.visualization === 'light' ? 0.3 : 0.4,
        glow: 12,
        opacity: 0.8,
        duration: 1,
        particleDirection: 'hold'
      }
    };

    return baseValues[phase] || { scale: 1, innerScale: 1, glow: 15, opacity: 0.8, duration: 1, particleDirection: 'none' };
  };

  const breathingValues = getBreathingValues();

  // Simplified guidance text for Watch - just the action words
  const getPhaseGuidance = () => {
    const simpleGuidance = {
      inhale: 'Inhale',
      hold: 'Hold', 
      exhale: 'Exhale',
      'exhale-pause': 'Hold'
    };

    return simpleGuidance;
  };

  const phaseGuidance = getPhaseGuidance();

  if (phase === 'ready') {
    if (!technique) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900 text-white p-2 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-2xl"
              >
                🫁
              </motion.div>
            </div>
            <p className="text-sm text-white/80">Loading breathing technique...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900 text-white p-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-1 text-white/60 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-sm font-medium">{technique.name}</h2>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center space-y-4">
          <div className="space-y-3">
            <motion.div 
              className="w-20 h-20 mx-auto rounded-full relative flex items-center justify-center"
              style={{
                background: technique.id === 'coherent' 
                  ? 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(99, 102, 241, 0.2) 50%, rgba(139, 92, 246, 0.1) 100%)'
                  : technique.id === 'exhalation'
                  ? 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, rgba(99, 102, 241, 0.1) 100%)'
                  : 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, rgba(245, 158, 11, 0.2) 50%, rgba(217, 119, 6, 0.1) 100%)'
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.3))'
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="text-3xl relative z-10"
                animate={{ 
                  scale: [1, 1.2, 1],
                  filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)']
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {technique.emoji}
              </motion.div>
            </motion.div>
            
            <div className="space-y-2">
              <p className="text-sm text-white/90 font-medium">
                Release the energy of
              </p>
              <p className="text-blue-300 font-semibold text-base">
                {stressWord}
              </p>
            </div>
          </div>

          {/* Technique-specific Description */}
          <div className="space-y-3 bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <p className="text-xs text-white/80 mb-3">
              {technique.description} ({technique.duration}):
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"></div>
                <span className="text-emerald-300">Inhale {technique.phases.inhale}s</span>
              </div>
              
              {technique.phases.hold && technique.phases.hold > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
                  <span className="text-yellow-300">Hold {technique.phases.hold}s</span>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"></div>
                <span className="text-pink-300">Exhale {technique.phases.exhale}s</span>
              </div>
              
              {technique.phases.exhaleHold && technique.phases.exhaleHold > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-1 bg-gradient-to-r from-gray-400 to-slate-400 rounded-full"></div>
                  <span className="text-gray-300">Pause {technique.phases.exhaleHold}s</span>
                </div>
              )}
            </div>
          </div>

          {/* Start Button */}
          <Button
            onClick={startExercise}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-700 rounded-xl border border-white/20 shadow-lg"
            style={{
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
            }}
          >
            Begin {technique.shortName}
          </Button>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-1 mt-4">
          {Array.from({ length: Math.min(technique.cycles, 8) }).map((_, i) => (
            <div key={i} className="w-2 h-2 bg-gray-600 rounded-full" />
          ))}
          {technique.cycles > 8 && (
            <div className="text-xs text-white/60 ml-2">{technique.cycles} cycles</div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <motion.div 
        className="min-h-screen text-white relative overflow-hidden flex items-center justify-center"
        style={{ 
          background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.3) 0%, rgba(59, 130, 246, 0.2) 50%, rgba(30, 41, 59, 1) 100%)'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        {/* Completion Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-emerald-300 rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{
                duration: 3,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
          ))}
        </div>

        <div className="flex flex-col items-center justify-center text-center space-y-6 p-4">
          <motion.div
            className="w-20 h-20 rounded-full relative flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, rgba(59, 130, 246, 0.3) 100%)'
            }}
            animate={{ 
              scale: [1, 1.1, 1],
              boxShadow: [
                '0 0 20px rgba(16, 185, 129, 0.5)',
                '0 0 40px rgba(16, 185, 129, 0.8)',
                '0 0 20px rgba(16, 185, 129, 0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: 3 }}
          >
            <span className="text-3xl">🌟</span>
          </motion.div>
          
          <div className="space-y-3">
            <motion.h2 
              className="text-lg font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Energy Cleansed ✨
            </motion.h2>
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p className="text-sm text-emerald-300">
                {technique?.name} completed successfully
              </p>
              <p className="text-xs text-white/80">
                HRV: {initialHRV} → <span className="text-emerald-400 font-semibold">{finalHRV}</span>
              </p>
              <p className="text-xs text-white/60">
                {totalCycles} breathing cycles completed
              </p>
            </motion.div>
          </div>

          <motion.div
            className="text-center space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <p className="text-sm text-blue-200">
              Negative energy from <span className="text-pink-300 font-medium">{stressWord}</span> has been released
            </p>
            <p className="text-xs text-white/70">
              You are now filled with calm, positive energy
            </p>
          </motion.div>

          <Button
            onClick={() => onCompleted()}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 backdrop-blur-sm border border-white/30 rounded-xl"
            style={{
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
            }}
          >
            Continue Journey
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Dynamic Background with Energy Flow */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: phase === 'inhale' 
            ? technique?.id === 'coherent'
              ? 'radial-gradient(circle at center, rgba(59, 130, 246, 0.4) 0%, rgba(99, 102, 241, 0.3) 30%, rgba(30, 41, 59, 1) 100%)'
              : technique?.id === 'exhalation'
              ? 'radial-gradient(circle at center, rgba(16, 185, 129, 0.4) 0%, rgba(59, 130, 246, 0.3) 30%, rgba(30, 41, 59, 1) 100%)'
              : 'radial-gradient(circle at center, rgba(251, 191, 36, 0.4) 0%, rgba(245, 158, 11, 0.3) 30%, rgba(30, 41, 59, 1) 100%)'
            : phase === 'hold'
            ? 'radial-gradient(circle at center, rgba(251, 191, 36, 0.4) 0%, rgba(245, 158, 11, 0.3) 30%, rgba(30, 41, 59, 1) 100%)'
            : phase === 'exhale-pause'
            ? 'radial-gradient(circle at center, rgba(156, 163, 175, 0.4) 0%, rgba(107, 114, 128, 0.3) 30%, rgba(30, 41, 59, 1) 100%)'
            : 'radial-gradient(circle at center, rgba(236, 72, 153, 0.4) 0%, rgba(190, 24, 93, 0.3) 30%, rgba(30, 41, 59, 1) 100%)'
        }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />

      {/* Cycle Progress */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-white/80 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
        {cycle + 1}/{totalCycles} · {technique?.shortName}
      </div>

      {/* Main Energy Visualization */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Energy Flow Particles */}
        <AnimatePresence>
          {(phase === 'inhale' || phase === 'exhale') && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i * 15) * (Math.PI / 180);
                const startDistance = phase === 'inhale' ? 80 : 25; // Reduced distances for smaller screen
                const endDistance = phase === 'inhale' ? 25 : 80;
                
                return (
                  <motion.div
                    key={`${phase}-${i}`}
                    className="absolute rounded-full"
                    style={{
                      width: '3px',
                      height: '3px',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: phase === 'inhale' 
                        ? technique?.id === 'coherent'
                          ? 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(99, 102, 241, 0.6) 100%)'
                          : technique?.id === 'exhalation'
                          ? 'radial-gradient(circle, rgba(16, 185, 129, 0.8) 0%, rgba(59, 130, 246, 0.6) 100%)'
                          : 'radial-gradient(circle, rgba(251, 191, 36, 0.8) 0%, rgba(245, 158, 11, 0.6) 100%)'
                        : 'radial-gradient(circle, rgba(236, 72, 153, 0.8) 0%, rgba(190, 24, 93, 0.6) 100%)'
                    }}
                    initial={{
                      x: Math.cos(angle) * startDistance,
                      y: Math.sin(angle) * startDistance,
                      opacity: phase === 'inhale' ? 0.8 : 1,
                      scale: phase === 'inhale' ? 1 : 1.5
                    }}
                    animate={{
                      x: Math.cos(angle) * endDistance,
                      y: Math.sin(angle) * endDistance,
                      opacity: phase === 'inhale' ? 1 : 0,
                      scale: phase === 'inhale' ? 1.5 : 0.5
                    }}
                    transition={{
                      duration: breathingValues.duration,
                      ease: 'easeInOut',
                      delay: i * 0.05
                    }}
                  />
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* Central Energy Core */}
        <motion.div
          className="relative flex items-center justify-center"
          animate={{
            scale: breathingValues.scale
          }}
          transition={{ 
            duration: breathingValues.duration,
            ease: 'easeInOut'
          }}
        >
          {/* Technique-specific Visualization */}
          {technique?.visualization === 'box' && (
            <motion.div
              className="absolute w-28 h-28 border-2"
              style={{
                borderColor: 'rgba(255,255,255,0.4)',
                borderRadius: '8px'
              }}
              animate={{
                borderColor: phase === 'hold' || phase === 'exhale-pause' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                boxShadow: `0 0 ${breathingValues.glow * 1.5}px ${
                  phase === 'inhale' ? 'rgba(251, 191, 36, 0.4)' :
                  phase === 'hold' ? 'rgba(251, 191, 36, 0.6)' :
                  phase === 'exhale-pause' ? 'rgba(156, 163, 175, 0.4)' :
                  'rgba(236, 72, 153, 0.4)'
                }`
              }}
              transition={{ duration: 1 }}
            />
          )}

          {/* Outer Energy Ring */}
          <motion.div
            className="absolute w-28 h-28 rounded-full"
            style={{
              background: technique?.visualization === 'box' ? 'transparent' :
                phase === 'inhale' 
                  ? technique?.id === 'coherent'
                    ? 'conic-gradient(from 0deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2), rgba(59, 130, 246, 0.2))'
                    : technique?.id === 'exhalation'
                    ? 'conic-gradient(from 0deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.2))'
                    : 'conic-gradient(from 0deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.2))'
                  : phase === 'hold'
                  ? 'conic-gradient(from 0deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3), rgba(251, 191, 36, 0.3))'
                  : phase === 'exhale-pause'
                  ? 'conic-gradient(from 0deg, rgba(156, 163, 175, 0.2), rgba(107, 114, 128, 0.2), rgba(156, 163, 175, 0.2))'
                  : 'conic-gradient(from 0deg, rgba(236, 72, 153, 0.2), rgba(190, 24, 93, 0.2), rgba(236, 72, 153, 0.2))',
              border: technique?.visualization === 'box' ? 'none' : '1px solid rgba(255,255,255,0.2)'
            }}
            animate={{
              rotate: phase === 'hold' || phase === 'exhale-pause' ? 0 : 360,
              borderColor: phase === 'hold' || phase === 'exhale-pause' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
              boxShadow: `0 0 ${breathingValues.glow * 1.5}px ${
                phase === 'inhale' ? 'rgba(16, 185, 129, 0.3)' :
                phase === 'hold' ? 'rgba(251, 191, 36, 0.4)' :
                phase === 'exhale-pause' ? 'rgba(156, 163, 175, 0.3)' :
                'rgba(236, 72, 153, 0.3)'
              }`
            }}
            transition={{ 
              rotate: { duration: phase === 'hold' || phase === 'exhale-pause' ? 0 : 20, repeat: Infinity, ease: 'linear' },
              borderColor: { duration: 1 },
              boxShadow: { duration: 1 }
            }}
          />

          {/* Middle Energy Ring */}
          <motion.div
            className="absolute w-20 h-20 rounded-full border-2"
            style={{
              borderColor: 'rgba(255,255,255,0.4)'
            }}
            animate={{
              borderColor: phase === 'hold' || phase === 'exhale-pause' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
              boxShadow: `0 0 ${breathingValues.glow}px ${
                phase === 'inhale' ? 'rgba(16, 185, 129, 0.5)' :
                phase === 'hold' ? 'rgba(251, 191, 36, 0.6)' :
                phase === 'exhale-pause' ? 'rgba(156, 163, 175, 0.5)' :
                'rgba(236, 72, 153, 0.5)'
              }`
            }}
            transition={{ duration: 1 }}
          />

          {/* Inner Energy Core */}
          <motion.div
            className="w-16 h-16 rounded-full backdrop-blur-sm flex items-center justify-center relative overflow-hidden"
            style={{
              background: phase === 'inhale' 
                ? technique?.id === 'coherent'
                  ? 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(99, 102, 241, 0.2) 100%)'
                  : technique?.id === 'exhalation'
                  ? 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(59, 130, 246, 0.2) 100%)'
                  : 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, rgba(245, 158, 11, 0.2) 100%)'
                : phase === 'hold'
                ? 'radial-gradient(circle, rgba(251, 191, 36, 0.5) 0%, rgba(245, 158, 11, 0.3) 100%)'
                : phase === 'exhale-pause'
                ? 'radial-gradient(circle, rgba(156, 163, 175, 0.4) 0%, rgba(107, 114, 128, 0.2) 100%)'
                : 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, rgba(190, 24, 93, 0.2) 100%)',
              border: '2px solid rgba(255,255,255,0.6)',
              boxShadow: `0 0 ${breathingValues.glow}px ${
                phase === 'inhale' ? 'rgba(16, 185, 129, 0.6)' :
                phase === 'hold' ? 'rgba(251, 191, 36, 0.7)' :
                phase === 'exhale-pause' ? 'rgba(156, 163, 175, 0.6)' :
                'rgba(236, 72, 153, 0.6)'
              }`
            }}
            animate={{
              scale: breathingValues.innerScale
            }}
            transition={{ 
              duration: breathingValues.duration,
              ease: 'easeInOut'
            }}
          />
        </motion.div>
      </div>

      {/* Main Instruction */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <p className="text-xl font-medium mb-2">
            {phaseGuidance[phase]}
          </p>
          <p className="text-xs text-white/60">
            {Math.ceil(countdown)}s
          </p>
        </motion.div>
      </div>
    </div>
  );
};