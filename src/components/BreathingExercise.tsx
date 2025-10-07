import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { motion, AnimatePresence } from 'motion/react';
import { useDevice } from './DeviceContext';

interface BreathingExerciseProps {
  stressWord: string;
  onCompleted: () => void;
  onCancel?: () => void; // Optional cancel callback for voluntary breathing
  duration?: number; // Optional duration override for meditation sessions
  isEmbedded?: boolean; // Whether this is embedded in a meditation session
  backgroundMusic?: boolean; // Whether background music is enabled
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
}

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({ 
  stressWord, 
  onCompleted,
  onCancel,
  duration,
  isEmbedded = false,
  backgroundMusic = false
}) => {
  const { isWatch, isPhone } = useDevice();
  const [phase, setPhase] = useState<Phase>('ready');
  const [cycle, setCycle] = useState(0);
  const [progress, setProgress] = useState(0);
  const [initialHRV, setInitialHRV] = useState(0);
  const [finalHRV, setFinalHRV] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [technique, setTechnique] = useState<BreathingTechnique | null>(null);

  // Define breathing techniques
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
      visualization: 'circle'
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
      visualization: 'light'
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
      visualization: 'circle'
    }
  ];

  // Randomly select technique on component mount, adjust for meditation duration if provided
  useEffect(() => {
    const randomTechnique = breathingTechniques[Math.floor(Math.random() * breathingTechniques.length)];
    
    // If this is for meditation and duration is provided, adjust the cycles
    if (isEmbedded && duration) {
      const avgCycleTime = (randomTechnique.phases.inhale + (randomTechnique.phases.hold || 0) + 
                           randomTechnique.phases.exhale + (randomTechnique.phases.exhaleHold || 0)) / 60; // minutes
      const adjustedCycles = Math.max(1, Math.floor(duration / avgCycleTime));
      
      setTechnique({
        ...randomTechnique,
        cycles: adjustedCycles,
        duration: `${duration} min`
      });
    } else {
      setTechnique(randomTechnique);
    }
  }, [duration, isEmbedded]);

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
            setProgress((nextCycle / totalCycles) * 100);
            
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
          setProgress((nextCycle / totalCycles) * 100);
          
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
    setProgress(0);
  };

  // Get breathing animation values based on technique and phase
  const getBreathingValues = () => {
    if (!technique) {
      return { scale: 1, glow: 20, opacity: 0.8, duration: 1 };
    }

    const baseValues = {
      inhale: {
        scale: technique.visualization === 'circle' ? 1.4 : technique.visualization === 'light' ? 1.2 : 1.3,
        glow: 25,
        opacity: 0.9,
        duration: technique.phases.inhale
      },
      hold: {
        scale: technique.visualization === 'circle' ? 1.4 : technique.visualization === 'light' ? 1.2 : 1.3,
        glow: 35,
        opacity: 1,
        duration: 1
      },
      exhale: {
        scale: technique.visualization === 'circle' ? 0.8 : technique.visualization === 'light' ? 0.6 : 0.7,
        glow: technique.visualization === 'light' ? 20 : 15,
        opacity: technique.visualization === 'light' ? 0.9 : 0.7,
        duration: technique.phases.exhale
      },
      'exhale-pause': {
        scale: technique.visualization === 'circle' ? 0.8 : technique.visualization === 'light' ? 0.6 : 0.7,
        glow: 15,
        opacity: 0.6,
        duration: 1
      }
    };

    return baseValues[phase] || { scale: 1, glow: 20, opacity: 0.8, duration: 1 };
  };

  const breathingValues = getBreathingValues();

  // Device and technique-specific guidance text
  const getPhaseGuidance = () => {
    if (!technique) return {};

    if (isPhone) {
      // iPhone: Rich, immersive guidance based on technique
      const guidanceMap = {
        coherent: {
          inhale: {
            title: 'Breathe In Harmony',
            description: 'Imagine your breath flowing like ocean waves, steady and rhythmic, as you draw in calm energy for exactly 5 seconds',
            ambient: '🌊 Ocean waves of calm flow into your being'
          },
          exhale: {
            title: 'Release in Rhythm',
            description: 'Let your breath flow out like gentle tides returning to the sea, carrying away tension in perfect 5-second harmony',
            ambient: '🌊 Tension flows away like gentle tides'
          }
        },
        exhalation: {
          inhale: {
            title: 'Draw Energy',
            description: 'Breathe in cool mountain air for 4 seconds, filling your lungs with crisp, pure energy',
            ambient: '🏔️ Mountain air fills you with pure energy'
          },
          exhale: {
            title: 'Release Deeply',
            description: 'Slowly release for 8 long seconds, like a gentle waterfall cascading down smooth rocks, washing away all stress',
            ambient: '💧 Like a waterfall, stress cascades away'
          }
        },
        rhythm: {
          inhale: {
            title: 'Breathe Circle',
            description: 'Draw in energy for 4 steady seconds, like filling a glowing circle with golden light',
            ambient: '🔵 Golden light fills the breathing circle'
          },
          hold: {
            title: 'Hold Circle',
            description: 'Pause for 4 seconds, feeling the energy expand and glow within your breathing circle',
            ambient: '✨ Energy expands within the circle'
          },
          exhale: {
            title: 'Release Circle',
            description: 'Breathe out for 4 controlled seconds, letting the circle gently release flowing energy',
            ambient: '🌀 Flowing release from the circle'
          },
          'exhale-pause': {
            title: 'Rest Circle',
            description: 'Rest for 4 peaceful seconds, completing the perfect circle of breath and renewal',
            ambient: '🔵 Perfect circle of breath completed'
          }
        }
      };
      return guidanceMap[technique.id] || {};
    } else {
      // Watch: Concise, technique-aware
      const guidanceMap = {
        coherent: {
          inhale: { title: '🌊 Breathe in rhythm (5s)', description: '', ambient: '' },
          exhale: { title: '🌊 Release in rhythm (5s)', description: '', ambient: '' }
        },
        exhalation: {
          inhale: { title: '🏔️ Quick inhale (4s)', description: '', ambient: '' },
          exhale: { title: '💧 Long exhale (8s)', description: '', ambient: '' }
        },
        rhythm: {
          inhale: { title: '🔵 Inhale (4s)', description: '', ambient: '' },
          hold: { title: '✨ Hold (4s)', description: '', ambient: '' },
          exhale: { title: '🌀 Exhale (4s)', description: '', ambient: '' },
          'exhale-pause': { title: '🔵 Pause (4s)', description: '', ambient: '' }
        }
      };
      return guidanceMap[technique.id] || {};
    }
  };

  const phaseGuidance = getPhaseGuidance();

  if (phase === 'ready') {
    if (!technique) {
      return <div className="p-6 text-center">Loading breathing technique...</div>;
    }

    return (
      <div className="space-y-6 pb-20">
        {/* Header */}
        <Card className="p-6 text-center bg-gradient-to-br from-slate-50 to-gray-100 border-0">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mb-4 shadow-lg">
            <motion.div
              className="text-3xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {technique.emoji}
            </motion.div>
          </div>
          <h2 className="mb-2 text-slate-800">{technique.name}</h2>
          <p className="text-muted-foreground mb-6">
            {technique.description}
          </p>
          <p className="text-sm text-blue-600 mb-6">
            Transform stress from <span className="font-medium">{stressWord}</span> into calm energy
          </p>
          
          {/* Instructions with technique-specific content */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 mb-6 shadow-sm">
            <h3 className="text-sm font-medium mb-4 text-slate-700">
              We'll complete {technique.cycles} cycles ({technique.duration}):
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-blue-600 font-medium">
                  Inhale for {technique.phases.inhale} seconds
                </span>
                {isPhone && technique.id === 'coherent' && <span className="text-xs text-blue-400">- Ocean wave rhythm</span>}
                {isPhone && technique.id === 'exhalation' && <span className="text-xs text-blue-400">- Mountain air energy</span>}
                {isPhone && technique.id === 'rhythm' && <span className="text-xs text-blue-400">- Circle expansion</span>}
              </div>
              
              {technique.phases.hold && technique.phases.hold > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-yellow-600 font-medium">
                    Hold for {technique.phases.hold} seconds
                  </span>
                  {isPhone && <span className="text-xs text-yellow-500">- Circle glow</span>}
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-pink-400 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-pink-600 font-medium">
                  Exhale for {technique.phases.exhale} seconds
                </span>
                {isPhone && technique.id === 'coherent' && <span className="text-xs text-pink-400">- Ocean wave release</span>}
                {isPhone && technique.id === 'exhalation' && <span className="text-xs text-pink-400">- Waterfall flow</span>}
                {isPhone && technique.id === 'rhythm' && <span className="text-xs text-pink-400">- Circle release</span>}
              </div>
              
              {technique.phases.exhaleHold && technique.phases.exhaleHold > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-gray-600 font-medium">
                    Pause for {technique.phases.exhaleHold} seconds
                  </span>
                  {isPhone && <span className="text-xs text-gray-400">- Circle rest</span>}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={startExercise} 
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg"
            >
              Start {technique.shortName}
            </Button>
            
            {onCancel && (
              <Button 
                variant="outline"
                onClick={onCancel} 
                className="w-full py-2"
              >
                Back to Mood Tracker
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <div className="space-y-6 pb-20">
        <motion.div
          className="min-h-[500px] rounded-2xl relative overflow-hidden flex items-center justify-center"
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Floating celebration particles */}
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-white rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.5, 1.5, 0.5],
                y: [0, -30, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeInOut'
              }}
            />
          ))}
          
          <div className="text-center z-10 text-white">
            <motion.div
              className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6 shadow-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: 3 }}
            >
              <span className="text-4xl">✨</span>
            </motion.div>
            
            <h2 className="mb-3 text-white">Transformation Complete!</h2>
            <p className="text-sm text-white/90 mb-6">
              You've successfully completed {technique?.name} breathing
            </p>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/30">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/80">HRV Improvement:</span>
                <span className="font-medium text-white">{initialHRV} → {finalHRV} (+{finalHRV - initialHRV})</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-white/80">Cycles Completed:</span>
                <span className="font-medium text-white">{totalCycles}/{totalCycles}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-white/80">Technique:</span>
                <span className="font-medium text-white">{technique?.name}</span>
              </div>
            </div>

            <Button 
              onClick={() => onCompleted()} 
              className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl text-white"
            >
              Continue Your Journey
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Progress Header - Fixed Height */}
      <Card className="p-4 bg-slate-900 text-white border-0 h-20 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm">
            <span className="font-medium">Cycle {cycle + 1}</span>
            <span className="text-white/70"> of {totalCycles}</span>
            <span className="text-white/50 ml-2">({technique?.name})</span>
          </div>
          <div className="text-sm font-medium">{Math.round(progress)}%</div>
        </div>
        <Progress value={progress} className="h-2 bg-white/20" />
      </Card>

      {/* Main Breathing Visualization - Fixed Height to Prevent Jumping */}
      <div 
        className="relative rounded-2xl overflow-hidden w-full" 
        style={{ height: '500px', minHeight: '500px', maxHeight: '500px' }}
      >
        {/* Enhanced Dynamic Background with depth */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: phase === 'inhale' 
              ? 'radial-gradient(ellipse at 30% 20%, #1e40af 0%, #3b82f6 35%, #1d4ed8 100%)'
              : phase === 'hold'
              ? 'radial-gradient(ellipse at 70% 30%, #f59e0b 0%, #fbbf24 35%, #d97706 100%)'
              : phase === 'exhale-pause'
              ? 'radial-gradient(ellipse at 50% 50%, #6b7280 0%, #9ca3af 35%, #4b5563 100%)'
              : 'radial-gradient(ellipse at 50% 80%, #be185d 0%, #ec4899 35%, #9d174d 100%)'
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        {/* Ambient light overlay */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: phase === 'inhale' 
              ? 'radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)'
              : phase === 'hold'
              ? 'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.4) 0%, transparent 60%)'
              : phase === 'exhale-pause'
              ? 'radial-gradient(circle at 50% 50%, rgba(156, 163, 175, 0.3) 0%, transparent 50%)'
              : 'radial-gradient(circle at 50% 70%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)'
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: breathingValues.duration,
            ease: 'easeInOut',
            repeat: Infinity
          }}
        />

        {/* Central Breathing Visualization - Fixed Container to Prevent Layout Shift */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-80 h-80 flex items-center justify-center">
            <motion.div
              className="relative flex items-center justify-center"
              style={{ 
                transformOrigin: 'center',
                willChange: 'transform'
              }}
              animate={{
                scale: breathingValues.scale
              }}
              transition={{ 
                duration: breathingValues.duration,
                ease: 'easeInOut'
              }}
            >
              {/* Outer Ring */}
              <motion.div
                className="absolute w-80 h-80 rounded-full border-2"
                style={{
                  borderColor: 'rgba(255,255,255,0.2)'
                }}
                animate={{
                  borderColor: phase === 'hold' || phase === 'exhale-pause' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
                  boxShadow: `0 0 ${breathingValues.glow * 3}px rgba(255,255,255,${breathingValues.opacity * 0.3})`
                }}
                transition={{ duration: 1 }}
              />

              {/* Middle Ring */}
              <motion.div
                className="absolute w-60 h-60 rounded-full border-2"
                style={{
                  borderColor: 'rgba(255,255,255,0.4)'
                }}
                animate={{
                  borderColor: phase === 'hold' || phase === 'exhale-pause' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                  boxShadow: `0 0 ${breathingValues.glow * 2}px rgba(255,255,255,${breathingValues.opacity * 0.5})`
                }}
                transition={{ duration: 1 }}
              />

              {/* Inner Ring */}
              <motion.div
                className="absolute w-40 h-40 rounded-full border-2"
                style={{
                  borderColor: 'rgba(255,255,255,0.6)'
                }}
                animate={{
                  borderColor: phase === 'hold' || phase === 'exhale-pause' ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)',
                  boxShadow: `0 0 ${breathingValues.glow}px rgba(255,255,255,${breathingValues.opacity * 0.7})`
                }}
                transition={{ duration: 1 }}
              />

              {/* Core Circle */}
              <motion.div
                className="w-28 h-28 rounded-full backdrop-blur-sm flex items-center justify-center relative"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                  border: '2px solid rgba(255,255,255,0.5)'
                }}
                animate={{
                  borderColor: phase === 'hold' || phase === 'exhale-pause' ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.5)',
                  boxShadow: `0 0 ${breathingValues.glow}px rgba(255,255,255,${breathingValues.opacity})`,
                  background: phase === 'hold' || phase === 'exhale-pause'
                    ? 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)'
                    : 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)'
                }}
                transition={{ duration: 1 }}
              >
                {/* Pulsing inner light during hold/pause */}
                {(phase === 'hold' || phase === 'exhale-pause') && (
                  <motion.div
                    className="absolute inset-3 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)'
                    }}
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Phase Indicators - Fixed Container */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-2 items-center justify-center">
            <motion.div 
              className={`w-3 h-3 rounded-full ${phase === 'inhale' ? 'bg-blue-400' : 'bg-white/30'}`}
              animate={{ scale: phase === 'inhale' ? 1.3 : 1 }}
              style={{ transformOrigin: 'center' }}
            />
            {technique?.phases.hold && technique.phases.hold > 0 && (
              <motion.div 
                className={`w-3 h-3 rounded-full ${phase === 'hold' ? 'bg-yellow-400' : 'bg-white/30'}`}
                animate={{ scale: phase === 'hold' ? 1.3 : 1 }}
                style={{ transformOrigin: 'center' }}
              />
            )}
            <motion.div 
              className={`w-3 h-3 rounded-full ${phase === 'exhale' ? 'bg-pink-400' : 'bg-white/30'}`}
              animate={{ scale: phase === 'exhale' ? 1.3 : 1 }}
              style={{ transformOrigin: 'center' }}
            />
            {technique?.phases.exhaleHold && technique.phases.exhaleHold > 0 && (
              <motion.div 
                className={`w-3 h-3 rounded-full ${phase === 'exhale-pause' ? 'bg-gray-400' : 'bg-white/30'}`}
                animate={{ scale: phase === 'exhale-pause' ? 1.3 : 1 }}
                style={{ transformOrigin: 'center' }}
              />
            )}
          </div>
        </div>

        {/* Device-Responsive Instructions Container */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className={`bg-black/30 backdrop-blur-sm rounded-2xl px-6 py-4 w-[320px] ${isPhone ? 'h-[160px]' : 'h-[100px]'} flex flex-col justify-center`}>
            <motion.div
              key={`title-${phase}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-8 flex items-center justify-center"
            >
              <p className="text-xl font-medium text-white">
                {phaseGuidance[phase]?.title || ''}
              </p>
            </motion.div>
            
            <motion.div
              key={`description-${phase}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={`${isPhone ? 'h-16' : 'h-4'} flex items-center justify-center px-2`}
            >
              {isPhone && (
                <p className="text-sm text-white/90 leading-relaxed text-center">
                  {phaseGuidance[phase]?.description || ''}
                </p>
              )}
            </motion.div>
            
            <div className="h-12 flex items-center justify-center">
              <motion.div
                className="text-3xl font-bold text-white h-12 flex items-center justify-center"
                animate={{ 
                  scale: countdown > 0 ? [1, 1.1, 1] : 1,
                  opacity: countdown > 0 ? 1 : 0,
                  textShadow: countdown > 0 ? [
                    '0 0 10px rgba(255,255,255,0.5)',
                    '0 0 20px rgba(255,255,255,0.8)',
                    '0 0 10px rgba(255,255,255,0.5)'
                  ] : '0 0 0px rgba(255,255,255,0)'
                }}
                transition={{ duration: 1, repeat: countdown > 0 ? Infinity : 0 }}
              >
                {countdown > 0 ? countdown : ''}
              </motion.div>
            </div>
          </div>
        </div>

        {/* iPhone-Only Ambient Guidance */}
        {isPhone && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center">
            <div className="bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2 w-[280px] h-8 flex items-center justify-center">
              <motion.p
                key={`ambient-${phase}`}
                className="text-xs text-white/80"
                animate={{
                  opacity: phase === 'ready' ? 0 : [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 4,
                  ease: 'easeInOut',
                  repeat: Infinity
                }}
              >
                {phaseGuidance[phase]?.ambient || ''}
              </motion.p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};