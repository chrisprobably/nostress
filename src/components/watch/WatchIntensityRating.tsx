import React, { useState } from 'react';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { ChevronLeft, Check } from 'lucide-react';

interface WatchIntensityRatingProps {
  mood: string;
  moodEmoji: string;
  moodCategory: string;
  onIntensitySelected: (intensity: number) => void;
  onBack: () => void;
}

const getIntensityColor = (intensity: number, isSelected: boolean = false): string => {
  if (intensity <= 2) {
    return isSelected ? 'border-green-400 bg-green-400/20' : 'border-green-600 hover:border-green-400';
  } else if (intensity <= 4) {
    return isSelected ? 'border-yellow-400 bg-yellow-400/20' : 'border-yellow-600 hover:border-yellow-400';
  } else if (intensity <= 6) {
    return isSelected ? 'border-orange-400 bg-orange-400/20' : 'border-orange-600 hover:border-orange-400';
  } else if (intensity <= 8) {
    return isSelected ? 'border-red-400 bg-red-400/20' : 'border-red-600 hover:border-red-400';
  } else {
    return isSelected ? 'border-red-500 bg-red-500/30' : 'border-red-700 hover:border-red-500';
  }
};

const getIntensityDots = (intensity: number): number => {
  if (intensity <= 2) return 1;
  if (intensity <= 4) return 2;
  if (intensity <= 6) return 3;
  if (intensity <= 8) return 4;
  return 5;
};

export const WatchIntensityRating: React.FC<WatchIntensityRatingProps> = ({
  mood,
  moodEmoji,
  moodCategory,
  onIntensitySelected,
  onBack
}) => {
  const [selectedIntensity, setSelectedIntensity] = useState<number | null>(null);

  const handleIntensitySelect = (intensity: number) => {
    setSelectedIntensity(intensity);
    
    // Auto-proceed after selection with slight delay
    setTimeout(() => {
      onIntensitySelected(intensity);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-1 text-white/60 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="text-center">
          <h2 className="text-sm font-medium">Rate Intensity</h2>
          <p className="text-xs text-gray-400">1-10 scale</p>
        </div>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Current Mood */}
      <div className="flex items-center justify-center gap-2 mb-4 p-2 border border-gray-600 rounded-lg">
        <span className="text-lg">{moodEmoji}</span>
        <div className="text-center">
          <div className="text-sm font-medium">{mood}</div>
          <div className="text-xs text-gray-400 capitalize">{moodCategory}</div>
        </div>
      </div>

      {/* Intensity Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {Array.from({ length: 10 }, (_, index) => {
          const intensity = index + 1;
          const isSelected = selectedIntensity === intensity;
          const dots = getIntensityDots(intensity);
          
          return (
            <motion.button
              key={intensity}
              onClick={() => handleIntensitySelect(intensity)}
              disabled={selectedIntensity !== null}
              className={`
                relative aspect-square rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center
                ${getIntensityColor(intensity, isSelected)}
                ${selectedIntensity && selectedIntensity !== intensity ? 'opacity-30' : ''}
              `}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: selectedIntensity ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Number */}
              <div className="text-lg font-medium mb-1">{intensity}</div>
              
              {/* Intensity Dots */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, dotIndex) => (
                  <div
                    key={dotIndex}
                    className={`w-1 h-1 rounded-full ${
                      dotIndex < dots ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Check className="w-2 h-2 text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Intensity Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Mild</span>
          <span>Strong</span>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500"
            initial={{ width: 0 }}
            animate={{ 
              width: selectedIntensity ? `${(selectedIntensity / 10) * 100}%` : '0%' 
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Selection Feedback */}
      {selectedIntensity && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-lg">{moodEmoji}</span>
            <span className="text-sm font-medium">{selectedIntensity}/10</span>
          </div>
          <p className="text-xs text-gray-400">
            Next: What's the source?
          </p>
        </motion.div>
      )}

      {/* Progress Dots */}
      <div className="flex justify-center gap-1 mt-4">
        <div className="w-2 h-2 bg-gray-600 rounded-full" />
        <div className="w-2 h-2 bg-white rounded-full" />
        <div className="w-2 h-2 bg-gray-600 rounded-full" />
        <div className="w-2 h-2 bg-gray-600 rounded-full" />
      </div>
    </div>
  );
};