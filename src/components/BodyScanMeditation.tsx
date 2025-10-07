import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { MeditationModule } from './BedroomMeditationPlan';

interface BodyScanMeditationProps {
  module: MeditationModule;
  isPlaying: boolean;
  backgroundMusic: boolean;
  onProgress: (progress: number) => void;
  onCompleted: () => void;
  onPause: () => void;
}

interface BodyPart {
  id: string;
  name: string;
  instruction: string;
  duration: number; // seconds
  position: { x: number; y: number }; // percentage positions
}

export const BodyScanMeditation: React.FC<BodyScanMeditationProps> = ({
  module,
  isPlaying,
  backgroundMusic,
  onProgress,
  onCompleted,
  onPause
}) => {
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(module.duration * 60);
  const [currentPartTime, setCurrentPartTime] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Body parts sequence for progressive relaxation
  const bodyParts: BodyPart[] = [
    {
      id: 'head',
      name: 'Head & Face',
      instruction: 'Focus on your forehead, eyes, cheeks, and jaw. Allow any tension to melt away like warm honey.',
      duration: 45,
      position: { x: 50, y: 15 }
    },
    {
      id: 'neck',
      name: 'Neck & Shoulders',
      instruction: 'Feel your neck and shoulders. Let them drop and release, imagining stress flowing out like water.',
      duration: 60,
      position: { x: 50, y: 25 }
    },
    {
      id: 'arms',
      name: 'Arms & Hands',
      instruction: 'Notice your arms from shoulders to fingertips. Let them become heavy and completely relaxed.',
      duration: 50,
      position: { x: 25, y: 40 }
    },
    {
      id: 'chest',
      name: 'Chest & Heart',
      instruction: 'Bring awareness to your chest. Feel your breathing naturally slow and deepen with each breath.',
      duration: 55,
      position: { x: 50, y: 40 }
    },
    {
      id: 'abdomen',
      name: 'Abdomen',
      instruction: 'Focus on your belly area. Let it soften and expand freely with each gentle breath.',
      duration: 45,
      position: { x: 50, y: 50 }
    },
    {
      id: 'back',
      name: 'Back & Spine',
      instruction: 'Feel your back against the surface beneath you. Allow your spine to lengthen and settle.',
      duration: 50,
      position: { x: 50, y: 45 }
    },
    {
      id: 'hips',
      name: 'Hips & Pelvis',
      instruction: 'Notice your hips and pelvis. Let them sink down, releasing any held tension.',
      duration: 40,
      position: { x: 50, y: 60 }
    },
    {
      id: 'legs',
      name: 'Legs & Thighs',
      instruction: 'Bring attention to your thighs and legs. Feel them become heavy and completely at rest.',
      duration: 50,
      position: { x: 50, y: 75 }
    },
    {
      id: 'feet',
      name: 'Feet & Toes',
      instruction: 'Finally, focus on your feet and toes. Let them completely relax and release into stillness.',
      duration: 45,
      position: { x: 50, y: 90 }
    },
    {
      id: 'whole_body',
      name: 'Whole Body',
      instruction: 'Now feel your entire body as one peaceful, relaxed whole. Rest in this complete state of calm.',
      duration: 60,
      position: { x: 50, y: 50 }
    }
  ];

  const currentPart = bodyParts[currentPartIndex];
  const totalDuration = module.duration * 60;

  // Calculate part durations based on module duration
  const adjustedParts = bodyParts.map(part => ({
    ...part,
    duration: Math.floor((part.duration / bodyParts.reduce((sum, p) => sum + p.duration, 0)) * totalDuration)
  }));

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          onCompleted();
          return 0;
        }
        return prev - 1;
      });

      setCurrentPartTime(prev => {
        const newTime = prev + 1;
        const currentPartDuration = adjustedParts[currentPartIndex]?.duration || 60;
        
        if (newTime >= currentPartDuration && currentPartIndex < adjustedParts.length - 1) {
          setIsTransitioning(true);
          setTimeout(() => {
            setCurrentPartIndex(prev => prev + 1);
            setCurrentPartTime(0);
            setIsTransitioning(false);
          }, 1000);
          return newTime;
        }
        
        return newTime;
      });

      // Update progress
      const elapsed = totalDuration - timeRemaining;
      const progress = (elapsed / totalDuration) * 100;
      onProgress(Math.min(progress, 100));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, timeRemaining, currentPartIndex, totalDuration, adjustedParts, onCompleted, onProgress]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Time Display */}
      <Card className="p-4 bg-black/20 backdrop-blur-sm border-white/20 text-center">
        <div className="text-2xl font-light text-white mb-2">
          {formatTime(timeRemaining)}
        </div>
        <div className="text-sm text-white/60">
          Body Scan Meditation
        </div>
      </Card>

      {/* Body Visualization */}
      <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/20">
        <div className="relative w-full h-96 mx-auto">
          {/* Simple body outline */}
          <svg
            viewBox="0 0 200 400"
            className="w-full h-full"
            style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.1))' }}
          >
            {/* Head */}
            <ellipse
              cx="100"
              cy="40"
              rx="25"
              ry="30"
              fill="rgba(255,255,255,0.1)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              className={currentPart?.id === 'head' ? 'animate-pulse' : ''}
            />
            
            {/* Neck */}
            <rect
              x="90"
              y="65"
              width="20"
              height="20"
              fill="rgba(255,255,255,0.1)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              className={currentPart?.id === 'neck' ? 'animate-pulse' : ''}
            />
            
            {/* Torso */}
            <ellipse
              cx="100"
              cy="150"
              rx="40"
              ry="70"
              fill="rgba(255,255,255,0.1)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              className={['chest', 'abdomen', 'back'].includes(currentPart?.id || '') ? 'animate-pulse' : ''}
            />
            
            {/* Arms */}
            <ellipse
              cx="65"
              cy="120"
              rx="15"
              ry="45"
              fill="rgba(255,255,255,0.1)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              className={currentPart?.id === 'arms' ? 'animate-pulse' : ''}
            />
            <ellipse
              cx="135"
              cy="120"
              rx="15"
              ry="45"
              fill="rgba(255,255,255,0.1)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              className={currentPart?.id === 'arms' ? 'animate-pulse' : ''}
            />
            
            {/* Hips */}
            <ellipse
              cx="100"
              cy="230"
              rx="35"
              ry="25"
              fill="rgba(255,255,255,0.1)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              className={currentPart?.id === 'hips' ? 'animate-pulse' : ''}
            />
            
            {/* Legs */}
            <ellipse
              cx="85"
              cy="320"
              rx="18"
              ry="60"
              fill="rgba(255,255,255,0.1)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              className={currentPart?.id === 'legs' ? 'animate-pulse' : ''}
            />
            <ellipse
              cx="115"
              cy="320"
              rx="18"
              ry="60"
              fill="rgba(255,255,255,0.1)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              className={currentPart?.id === 'legs' ? 'animate-pulse' : ''}
            />
            
            {/* Feet */}
            <ellipse
              cx="80"
              cy="390"
              rx="12"
              ry="8"
              fill="rgba(255,255,255,0.1)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              className={currentPart?.id === 'feet' ? 'animate-pulse' : ''}
            />
            <ellipse
              cx="120"
              cy="390"
              rx="12"
              ry="8"
              fill="rgba(255,255,255,0.1)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              className={currentPart?.id === 'feet' ? 'animate-pulse' : ''}
            />

            {/* Active area highlight */}
            {currentPart && currentPart.id !== 'whole_body' && (
              <motion.circle
                cx={currentPart.position.x * 2}
                cy={currentPart.position.y * 4}
                r="15"
                fill="rgba(147, 197, 253, 0.3)"
                stroke="rgba(147, 197, 253, 0.8)"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            )}

            {/* Whole body glow for final stage */}
            {currentPart?.id === 'whole_body' && (
              <motion.rect
                x="50"
                y="20"
                width="100"
                height="360"
                rx="50"
                fill="rgba(147, 197, 253, 0.2)"
                stroke="rgba(147, 197, 253, 0.6)"
                strokeWidth="3"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            )}
          </svg>
        </div>
      </Card>

      {/* Current Instruction */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPart?.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/20 text-center">
            <motion.h3 
              className="text-xl font-medium text-white mb-4"
              animate={{ scale: isTransitioning ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.5 }}
            >
              {currentPart?.name}
            </motion.h3>
            
            <motion.p 
              className="text-white/80 leading-relaxed"
              animate={{ opacity: isTransitioning ? 0.5 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {currentPart?.instruction}
            </motion.p>

            {/* Progress indicator for current body part */}
            <div className="mt-6">
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>Focus Progress</span>
                <span>{currentPartIndex + 1}/{adjustedParts.length}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1">
                <motion.div
                  className="bg-blue-400 h-1 rounded-full"
                  style={{
                    width: `${((currentPartTime / (adjustedParts[currentPartIndex]?.duration || 60)) * 100)}%`
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Breathing Cue */}
      <Card className="p-4 bg-black/10 backdrop-blur-sm border-white/10">
        <div className="flex items-center justify-center">
          <motion.div
            className="w-4 h-4 rounded-full bg-blue-400 mr-3"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <span className="text-sm text-white/70">
            Breathe naturally and let your body relax
          </span>
        </div>
      </Card>

      {backgroundMusic && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-black/20 backdrop-blur-sm rounded-full border border-white/20">
            <motion.div
              className="w-2 h-2 rounded-full bg-purple-400"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs text-white/60">Ambient sounds playing</span>
          </div>
        </div>
      )}
    </div>
  );
};