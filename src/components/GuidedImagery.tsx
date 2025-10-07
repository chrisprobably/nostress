import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { MeditationModule } from './BedroomMeditationPlan';
import { Cloud, Waves, Mountain, TreePine, Sun, Star } from 'lucide-react';

interface GuidedImageryProps {
  module: MeditationModule;
  isPlaying: boolean;
  backgroundMusic: boolean;
  onProgress: (progress: number) => void;
  onCompleted: () => void;
  onPause: () => void;
}

interface ImageryScene {
  id: string;
  title: string;
  description: string;
  guidance: string[];
  duration: number; // seconds
  icon: React.ReactNode;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  ambientElements: Array<{
    type: 'particle' | 'wave' | 'float';
    count: number;
    color: string;
  }>;
}

export const GuidedImagery: React.FC<GuidedImageryProps> = ({
  module,
  isPlaying,
  backgroundMusic,
  onProgress,
  onCompleted,
  onPause
}) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [currentGuidanceIndex, setCurrentGuidanceIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(module.duration * 60);
  const [sceneProgress, setSceneProgress] = useState(0);

  // Imagery scenes for peaceful sleep transition
  const imageryScenes: ImageryScene[] = [
    {
      id: 'peaceful_beach',
      title: 'Peaceful Beach',
      description: 'A tranquil shoreline at sunset',
      guidance: [
        'Imagine yourself on a warm, sandy beach as the sun sets gently over the horizon...',
        'Feel the soft sand beneath you, still warm from the day\'s sunshine...',
        'Listen to the gentle rhythm of waves washing peacefully onto the shore...',
        'Feel a light, warm breeze carrying the fresh scent of ocean air...',
        'Watch the sky transform into beautiful shades of orange, pink, and purple...',
        'With each wave, feel yourself becoming more relaxed and peaceful...'
      ],
      duration: 90,
      icon: <Waves className="w-6 h-6" />,
      colors: {
        primary: 'from-orange-400 to-pink-500',
        secondary: 'from-blue-400 to-purple-500',
        accent: 'from-yellow-300 to-orange-400'
      },
      ambientElements: [
        { type: 'wave', count: 5, color: 'rgba(59, 130, 246, 0.3)' },
        { type: 'particle', count: 20, color: 'rgba(251, 191, 36, 0.5)' }
      ]
    },
    {
      id: 'forest_clearing',
      title: 'Forest Clearing',
      description: 'A serene glade surrounded by ancient trees',
      guidance: [
        'Find yourself in a peaceful clearing deep within an ancient forest...',
        'Tall, majestic trees surround you, their leaves rustling gently in the breeze...',
        'Soft, dappled sunlight filters through the canopy above...',
        'The air is fresh and clean, filled with the earthy scent of moss and pine...',
        'You\'re lying on a bed of soft, green moss that cradles your body...',
        'Feel completely safe and protected in this natural sanctuary...'
      ],
      duration: 90,
      icon: <TreePine className="w-6 h-6" />,
      colors: {
        primary: 'from-green-400 to-emerald-500',
        secondary: 'from-green-300 to-green-600',
        accent: 'from-yellow-300 to-green-400'
      },
      ambientElements: [
        { type: 'float', count: 15, color: 'rgba(34, 197, 94, 0.4)' },
        { type: 'particle', count: 25, color: 'rgba(251, 191, 36, 0.3)' }
      ]
    },
    {
      id: 'mountain_meadow',
      title: 'Mountain Meadow',
      description: 'A flower-filled meadow with distant peaks',
      guidance: [
        'You\'re resting in a beautiful meadow high in the mountains...',
        'Colorful wildflowers sway gently around you in the mountain breeze...',
        'Distant snow-capped peaks rise majestically against a clear sky...',
        'The air is crisp and pure, filled with the sweet fragrance of flowers...',
        'You feel a deep sense of peace and connection with nature...',
        'Let this mountain serenity fill your entire being with calm...'
      ],
      duration: 90,
      icon: <Mountain className="w-6 h-6" />,
      colors: {
        primary: 'from-blue-400 to-indigo-500',
        secondary: 'from-purple-400 to-blue-500',
        accent: 'from-pink-300 to-purple-400'
      },
      ambientElements: [
        { type: 'float', count: 30, color: 'rgba(236, 72, 153, 0.4)' },
        { type: 'particle', count: 10, color: 'rgba(147, 197, 253, 0.5)' }
      ]
    },
    {
      id: 'starry_night',
      title: 'Starry Night',
      description: 'Under a canopy of infinite stars',
      guidance: [
        'You\'re lying on soft grass under a vast, starry night sky...',
        'Countless stars twinkle peacefully above you like diamonds...',
        'The moon glows softly, casting gentle silver light around you...',
        'Feel the earth supporting you as you gaze up at the infinite cosmos...',
        'Each star represents a moment of peace entering your mind...',
        'Let the vastness and beauty of the night sky fill you with wonder and calm...',
        'As you prepare for sleep, carry this cosmic peace within you...'
      ],
      duration: 120,
      icon: <Star className="w-6 h-6" />,
      colors: {
        primary: 'from-indigo-600 to-purple-700',
        secondary: 'from-blue-600 to-indigo-800',
        accent: 'from-yellow-200 to-white'
      },
      ambientElements: [
        { type: 'particle', count: 50, color: 'rgba(255, 255, 255, 0.6)' },
        { type: 'float', count: 8, color: 'rgba(251, 191, 36, 0.4)' }
      ]
    }
  ];

  const currentScene = imageryScenes[currentSceneIndex];
  const currentGuidance = currentScene?.guidance[currentGuidanceIndex];
  const totalDuration = module.duration * 60;

  // Calculate scene durations based on module duration
  const adjustedScenes = imageryScenes.map(scene => ({
    ...scene,
    duration: Math.floor((scene.duration / imageryScenes.reduce((sum, s) => sum + s.duration, 0)) * totalDuration)
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

      setSceneProgress(prev => {
        const newProgress = prev + 1;
        const currentSceneDuration = adjustedScenes[currentSceneIndex]?.duration || 90;
        const guidanceInterval = Math.floor(currentSceneDuration / currentScene.guidance.length);
        
        // Progress guidance within scene
        const newGuidanceIndex = Math.floor(newProgress / guidanceInterval);
        if (newGuidanceIndex !== currentGuidanceIndex && newGuidanceIndex < currentScene.guidance.length) {
          setCurrentGuidanceIndex(newGuidanceIndex);
        }
        
        // Move to next scene
        if (newProgress >= currentSceneDuration && currentSceneIndex < adjustedScenes.length - 1) {
          setCurrentSceneIndex(prev => prev + 1);
          setCurrentGuidanceIndex(0);
          return 0;
        }
        
        return newProgress;
      });

      // Update overall progress
      const elapsed = totalDuration - timeRemaining;
      const progress = (elapsed / totalDuration) * 100;
      onProgress(Math.min(progress, 100));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, timeRemaining, currentSceneIndex, currentGuidanceIndex, currentScene, adjustedScenes, totalDuration, onCompleted, onProgress]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderAmbientElements = () => {
    return currentScene.ambientElements.map((element, elementIndex) => 
      Array.from({ length: element.count }).map((_, particleIndex) => (
        <motion.div
          key={`${currentScene.id}-${elementIndex}-${particleIndex}`}
          className="absolute rounded-full"
          style={{
            width: element.type === 'particle' ? '4px' : element.type === 'float' ? '8px' : '6px',
            height: element.type === 'particle' ? '4px' : element.type === 'float' ? '8px' : '6px',
            backgroundColor: element.color,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={
            element.type === 'particle' ? {
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1, 0.5],
            } : element.type === 'float' ? {
              y: [0, -30, 0],
              x: [0, Math.sin(particleIndex) * 10, 0],
              opacity: [0.4, 0.8, 0.4],
            } : {
              x: ['-100%', '100%'],
              opacity: [0, 0.6, 0],
            }
          }
          transition={{
            duration: element.type === 'particle' ? 4 + Math.random() * 2 : 
                     element.type === 'float' ? 6 + Math.random() * 3 : 8,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut'
          }}
        />
      ))
    );
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Time Display */}
      <Card className="p-4 bg-black/20 backdrop-blur-sm border-white/20 text-center">
        <div className="text-2xl font-light text-white mb-2">
          {formatTime(timeRemaining)}
        </div>
        <div className="text-sm text-white/60">
          Guided Imagery
        </div>
      </Card>

      {/* Scene Visualization */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 1 }}
        >
          <Card className="relative overflow-hidden h-64 border-white/20">
            {/* Dynamic background */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${currentScene.colors.primary}`}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            
            {/* Secondary gradient overlay */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-t ${currentScene.colors.secondary} opacity-40`}
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />

            {/* Ambient elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {renderAmbientElements()}
            </div>

            {/* Scene icon */}
            <div className="absolute top-4 right-4">
              <motion.div
                className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30"
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 20px rgba(255,255,255,0.2)',
                    '0 0 30px rgba(255,255,255,0.4)',
                    '0 0 20px rgba(255,255,255,0.2)'
                  ]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <div className="text-white">
                  {currentScene.icon}
                </div>
              </motion.div>
            </div>

            {/* Scene title */}
            <div className="absolute bottom-4 left-4 right-4">
              <motion.h3
                className="text-xl font-medium text-white mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {currentScene.title}
              </motion.h3>
              <motion.p
                className="text-sm text-white/80"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {currentScene.description}
              </motion.p>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Current Guidance */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentScene.id}-${currentGuidanceIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/20">
            <motion.p
              className="text-white/90 leading-relaxed text-center text-lg"
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              {currentGuidance}
            </motion.p>

            {/* Progress indicator for current scene */}
            <div className="mt-6">
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>Scene Progress</span>
                <span>{currentSceneIndex + 1}/{adjustedScenes.length}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1">
                <motion.div
                  className={`bg-gradient-to-r ${currentScene.colors.accent} h-1 rounded-full`}
                  style={{
                    width: `${((sceneProgress / (adjustedScenes[currentSceneIndex]?.duration || 90)) * 100)}%`
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Breathing Reminder */}
      <Card className="p-4 bg-black/10 backdrop-blur-sm border-white/10">
        <div className="flex items-center justify-center">
          <motion.div
            className="w-4 h-4 rounded-full bg-white/70 mr-3"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <span className="text-sm text-white/70">
            Breathe naturally as you immerse yourself in this peaceful scene
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
            <span className="text-xs text-white/60">Nature sounds enhancing imagery</span>
          </div>
        </div>
      )}
    </div>
  );
};