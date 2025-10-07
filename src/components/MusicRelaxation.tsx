import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { MeditationModule } from './BedroomMeditationPlan';
import { Volume2, VolumeX, Music, Waves, Wind, TreePine, CloudRain } from 'lucide-react';

interface MusicRelaxationProps {
  module: MeditationModule;
  isPlaying: boolean;
  backgroundMusic: boolean;
  onProgress: (progress: number) => void;
  onCompleted: () => void;
  onPause: () => void;
}

interface SoundTrack {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  visualPattern: 'waves' | 'particles' | 'pulse' | 'flow';
  bpm: number; // beats per minute for visual sync
}

export const MusicRelaxation: React.FC<MusicRelaxationProps> = ({
  module,
  isPlaying,
  backgroundMusic,
  onProgress,
  onCompleted,
  onPause
}) => {
  const [timeRemaining, setTimeRemaining] = useState(module.duration * 60);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isVolumeVisible, setIsVolumeVisible] = useState(false);

  // Sound tracks for bedtime relaxation
  const soundTracks: SoundTrack[] = [
    {
      id: 'ocean_waves',
      name: 'Ocean Waves',
      description: 'Gentle waves washing onto a peaceful shore',
      icon: <Waves className="w-5 h-5" />,
      color: 'from-blue-400 to-cyan-500',
      visualPattern: 'waves',
      bpm: 60
    },
    {
      id: 'forest_ambience',
      name: 'Forest Ambience',
      description: 'Rustling leaves and distant bird songs',
      icon: <TreePine className="w-5 h-5" />,
      color: 'from-green-400 to-emerald-500',
      visualPattern: 'particles',
      bpm: 45
    },
    {
      id: 'gentle_rain',
      name: 'Gentle Rain',
      description: 'Soft raindrops on leaves with distant thunder',
      icon: <CloudRain className="w-5 h-5" />,
      color: 'from-gray-400 to-blue-500',
      visualPattern: 'flow',
      bpm: 50
    },
    {
      id: 'wind_chimes',
      name: 'Wind Chimes',
      description: 'Peaceful chimes in a gentle breeze',
      icon: <Wind className="w-5 h-5" />,
      color: 'from-purple-400 to-pink-500',
      visualPattern: 'pulse',
      bpm: 40
    }
  ];

  const currentTrack = soundTracks[currentTrackIndex];
  const totalDuration = module.duration * 60;

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

      // Update progress
      const elapsed = totalDuration - timeRemaining;
      const progress = (elapsed / totalDuration) * 100;
      onProgress(Math.min(progress, 100));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, timeRemaining, totalDuration, onCompleted, onProgress]);

  // Auto-switch tracks
  useEffect(() => {
    if (!isPlaying) return;

    const trackDuration = Math.floor(totalDuration / soundTracks.length);
    const elapsed = totalDuration - timeRemaining;
    const newTrackIndex = Math.min(
      Math.floor(elapsed / trackDuration),
      soundTracks.length - 1
    );

    if (newTrackIndex !== currentTrackIndex) {
      setCurrentTrackIndex(newTrackIndex);
    }
  }, [timeRemaining, totalDuration, currentTrackIndex, soundTracks.length, isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderVisualPattern = () => {
    const animationDuration = 60 / currentTrack.bpm; // Convert BPM to seconds per beat

    switch (currentTrack.visualPattern) {
      case 'waves':
        return Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`wave-${i}`}
            className="absolute w-full h-2 rounded-full opacity-30"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.6), transparent)`,
              top: `${20 + i * 10}%`,
            }}
            animate={{
              x: ['-100%', '100%'],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: animationDuration * 2,
              repeat: Infinity,
              delay: i * (animationDuration / 3),
              ease: 'easeInOut'
            }}
          />
        ));

      case 'particles':
        return Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.6)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: animationDuration * 1.5,
              repeat: Infinity,
              delay: Math.random() * animationDuration,
              ease: 'easeInOut'
            }}
          />
        ));

      case 'flow':
        return Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`flow-${i}`}
            className="absolute w-1 h-8 rounded-full opacity-40"
            style={{
              background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.8), transparent)',
              left: `${5 + Math.random() * 90}%`,
            }}
            animate={{
              y: ['-20%', '120%'],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: animationDuration * 3,
              repeat: Infinity,
              delay: Math.random() * animationDuration * 2,
              ease: 'linear'
            }}
          />
        ));

      case 'pulse':
        return Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`pulse-${i}`}
            className="absolute rounded-full border-2 border-purple-400"
            style={{
              width: `${40 + i * 20}px`,
              height: `${40 + i * 20}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.6, 0.2, 0.6],
            }}
            transition={{
              duration: animationDuration,
              repeat: Infinity,
              delay: i * (animationDuration / 8),
              ease: 'easeInOut'
            }}
          />
        ));

      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Time Display */}
      <Card className="p-4 bg-black/20 backdrop-blur-sm border-white/20 text-center">
        <div className="text-2xl font-light text-white mb-2">
          {formatTime(timeRemaining)}
        </div>
        <div className="text-sm text-white/60">
          Natural Soundscapes
        </div>
      </Card>

      {/* Main Visualization */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTrack.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 1 }}
        >
          <Card className="relative overflow-hidden h-64 border-white/20">
            {/* Dynamic background */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${currentTrack.color}`}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: 'linear'
              }}
            />

            {/* Visual patterns */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {renderVisualPattern()}
            </div>

            {/* Central icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="p-6 rounded-full bg-white/20 backdrop-blur-sm border border-white/30"
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 30px rgba(255,255,255,0.2)',
                    '0 0 50px rgba(255,255,255,0.4)',
                    '0 0 30px rgba(255,255,255,0.2)'
                  ]
                }}
                transition={{
                  duration: 60 / currentTrack.bpm,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <div className="text-white text-2xl">
                  {currentTrack.icon}
                </div>
              </motion.div>
            </div>

            {/* Track info */}
            <div className="absolute bottom-4 left-4 right-4">
              <motion.div
                className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-white/20"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-lg font-medium text-white mb-1">
                  {currentTrack.name}
                </h3>
                <p className="text-sm text-white/80">
                  {currentTrack.description}
                </p>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Volume Control */}
      <Card className="p-4 bg-black/20 backdrop-blur-sm border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVolumeVisible(!isVolumeVisible)}
              className="p-2 text-white/70 hover:text-white"
            >
              {volume > 0 ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            
            <AnimatePresence>
              {isVolumeVisible && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 120 }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgba(147, 197, 253, 0.8) 0%, rgba(147, 197, 253, 0.8) ${volume * 100}%, rgba(255, 255, 255, 0.2) ${volume * 100}%, rgba(255, 255, 255, 0.2) 100%)`
                    }}
                  />
                  <span className="text-xs text-white/60 w-8">
                    {Math.round(volume * 100)}%
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="text-sm text-white/60">
            Track {currentTrackIndex + 1}/{soundTracks.length}
          </div>
        </div>
      </Card>

      {/* Track Progress */}
      <Card className="p-4 bg-black/10 backdrop-blur-sm border-white/10">
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-white/60">
            <span>Current Track</span>
            <span>{Math.round(((totalDuration - timeRemaining) % (totalDuration / soundTracks.length)) / (totalDuration / soundTracks.length) * 100)}%</span>
          </div>
          
          <div className="flex gap-1">
            {soundTracks.map((track, index) => (
              <div
                key={track.id}
                className={`flex-1 h-2 rounded-full transition-all ${
                  index === currentTrackIndex
                    ? `bg-gradient-to-r ${track.color}`
                    : index < currentTrackIndex
                    ? 'bg-white/40'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          
          <div className="flex justify-between text-xs text-white/50">
            <span>Playing: {currentTrack.name}</span>
            <span>Next: {soundTracks[(currentTrackIndex + 1) % soundTracks.length]?.name}</span>
          </div>
        </div>
      </Card>

      {/* Relaxation Reminder */}
      <Card className="p-4 bg-black/10 backdrop-blur-sm border-white/10">
        <div className="flex items-center justify-center">
          <motion.div
            className="w-4 h-4 rounded-full bg-white/70 mr-3"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 60 / currentTrack.bpm,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <span className="text-sm text-white/70">
            Let the sounds wash over you as you drift toward peaceful sleep
          </span>
        </div>
      </Card>

      {/* Sound visualization particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={`sound-particle-${i}`}
            className="absolute w-1 h-1 rounded-full bg-white/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 60 / currentTrack.bpm,
              repeat: Infinity,
              delay: Math.random() * (60 / currentTrack.bpm),
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    </div>
  );
};