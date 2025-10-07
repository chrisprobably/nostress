import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { TrendingUp, Smartphone } from 'lucide-react';

interface WatchFeedbackProps {
  onComplete: () => void;
  onViewDetails: () => void;
}

export const WatchFeedback: React.FC<WatchFeedbackProps> = ({ 
  onComplete,
  onViewDetails 
}) => {
  const [hrvBefore] = useState(72 + Math.floor(Math.random() * 10));
  const [hrvAfter] = useState(80 + Math.floor(Math.random() * 15));
  const [showImprovement, setShowImprovement] = useState(false);

  useEffect(() => {
    // Show improvement animation after delay
    const timer = setTimeout(() => {
      setShowImprovement(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const improvement = hrvAfter - hrvBefore;
  const improvementPercentage = Math.round((improvement / hrvBefore) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-500 to-yellow-400 text-white p-3">
      {/* Success Animation */}
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen text-center space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Celebration Emoji */}
        <motion.div
          className="text-5xl"
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 1.5,
            repeat: 2,
            ease: 'easeInOut'
          }}
        >
          🙌
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-medium mb-2">Well done</h2>
          <p className="text-sm text-white/80">
            Breathing exercise completed
          </p>
        </motion.div>

        {/* HRV Improvement */}
        <motion.div
          className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 w-full border border-white/30"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: showImprovement ? 1 : 0, scale: showImprovement ? 1 : 0.8 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-300" />
            <span className="text-sm font-medium">HRV improved</span>
          </div>

          {/* Before/After Display */}
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="text-center">
              <div className="text-lg font-semibold">{hrvBefore}</div>
              <div className="text-xs text-white/60">Before</div>
            </div>
            
            <motion.div
              className="text-2xl"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 0.5, repeat: 3, delay: 1.5 }}
            >
              →
            </motion.div>
            
            <div className="text-center">
              <motion.div
                className="text-lg font-semibold text-green-300"
                initial={{ scale: 1 }}
                animate={{ scale: showImprovement ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.5, delay: 1.5 }}
              >
                {hrvAfter}
              </motion.div>
              <div className="text-xs text-white/60">After</div>
            </div>
          </div>

          {/* Improvement Badge */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <span className="inline-block bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
              +{improvement} (+{improvementPercentage}%)
            </span>
          </motion.div>
        </motion.div>

        {/* Status Message */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5 }}
        >
          <p className="text-sm font-medium mb-1">
            Now you are good to go
          </p>
          <p className="text-xs text-white/70">
            Keep up the great work!
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="w-full space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3 }}
        >
          {/* Primary Action */}
          <Button
            onClick={onComplete}
            className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-2xl text-sm"
          >
            Done
          </Button>

          {/* Secondary Action */}
          <Button
            onClick={onViewDetails}
            variant="ghost"
            className="w-full py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-2xl text-xs flex items-center justify-center gap-2"
          >
            <Smartphone className="w-3 h-3" />
            View details on iPhone
          </Button>
        </motion.div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-1 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-2 h-2 bg-white rounded-full" />
          ))}
        </div>
      </motion.div>
    </div>
  );
};