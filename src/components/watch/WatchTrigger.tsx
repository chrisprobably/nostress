import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';

interface WatchTriggerProps {
  onLogMood: () => void;
  onSnooze: () => void;
}

type StressLevel = 'normal' | 'elevated' | 'extreme';

export const WatchTrigger: React.FC<WatchTriggerProps> = ({ onLogMood, onSnooze }) => {
  const [stressLevel, setStressLevel] = useState<StressLevel>('elevated');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hrvValue, setHrvValue] = useState(32); // Mock HRV value

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate HRV monitoring - only show trigger when HRV is abnormal
  useEffect(() => {
    // Simulate realistic HRV values that would trigger alerts
    const abnormalValues = [25, 28, 32, 70, 75, 80]; // Values outside normal range (30-65)
    const randomValue = abnormalValues[Math.floor(Math.random() * abnormalValues.length)];
    setHrvValue(randomValue);
    
    if (randomValue < 30) {
      setStressLevel('extreme'); // Very low HRV = high stress
    } else if (randomValue > 65) {
      setStressLevel('elevated'); // Very high HRV = elevated concern
    } else {
      setStressLevel('normal'); // This shouldn't happen in this simulation
    }
  }, []);

  const getStressConfig = () => {
    switch (stressLevel) {
      case 'normal':
        return {
          emoji: '😀',
          status: 'HRV Normal',
          subtitle: `${hrvValue}ms - In range`,
          gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          barColor: '#10B981',
          barAnimation: 'calm'
        };
      case 'elevated':
        return {
          emoji: '😐',
          status: 'HRV Too High',
          subtitle: `${hrvValue}ms - Above normal`,
          gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          barColor: '#F59E0B',
          barAnimation: 'moderate'
        };
      case 'extreme':
        return {
          emoji: '😖',
          status: 'HRV Too Low',
          subtitle: `${hrvValue}ms - Below normal`,
          gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          barColor: '#EF4444',
          barAnimation: 'intense'
        };
    }
  };

  const config = getStressConfig();

  const getBarVariants = (index: number) => {
    const baseDelay = index * 0.1;
    
    switch (config.barAnimation) {
      case 'calm':
        return {
          animate: {
            scaleY: [0.3, 0.7, 0.3],
            opacity: [0.6, 1, 0.6]
          },
          transition: {
            duration: 2,
            repeat: Infinity,
            delay: baseDelay,
            ease: 'easeInOut'
          }
        };
      case 'moderate':
        return {
          animate: {
            scaleY: [0.2, 0.9, 0.2],
            opacity: [0.7, 1, 0.7]
          },
          transition: {
            duration: 1.5,
            repeat: Infinity,
            delay: baseDelay,
            ease: 'easeInOut'
          }
        };
      case 'intense':
        return {
          animate: {
            scaleY: [0.1, 1, 0.1],
            opacity: [0.8, 1, 0.8]
          },
          transition: {
            duration: 0.8,
            repeat: Infinity,
            delay: baseDelay,
            ease: 'easeInOut'
          }
        };
    }
  };

  return (
    <motion.div
      className="min-h-screen text-white relative overflow-hidden"
      style={{ background: config.gradient }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Time Display */}
      <div className="absolute top-2 left-2 right-2 flex justify-between items-center text-xs">
        <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span>HRV Alert</span>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Emoji Status */}
        <motion.div
          className="text-6xl mb-2"
          animate={{ 
            scale: stressLevel === 'extreme' ? [1, 1.1, 1] : 1,
            rotate: stressLevel === 'extreme' ? [0, -2, 2, 0] : 0
          }}
          transition={{ 
            duration: stressLevel === 'extreme' ? 0.5 : 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {config.emoji}
        </motion.div>

        {/* Status Text */}
        <h2 className="text-sm font-medium mb-1">{config.status}</h2>
        <p className="text-xs text-white/80 mb-6">{config.subtitle}</p>

        {/* Energy Bars */}
        <div className="flex items-end justify-center gap-1 mb-8 h-12">
          {Array.from({ length: 3 }).map((_, index) => (
            <motion.div
              key={index}
              className="w-3 rounded-full origin-bottom"
              style={{ 
                backgroundColor: config.barColor,
                height: '100%'
              }}
              {...getBarVariants(index)}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          {/* Primary Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={onLogMood}
              className="w-full py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-2xl"
              style={{ fontSize: '14px' }}
            >
              📝 Log Mood
            </Button>
          </motion.div>

          {/* Secondary Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={onSnooze}
              variant="ghost"
              className="w-full py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-2xl"
              style={{ fontSize: '12px' }}
            >
              <Clock className="w-3 h-3 mr-1" />
              Snooze 15m
            </Button>
          </motion.div>
        </div>

        {/* Bottom Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-1 bg-white/30 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
};