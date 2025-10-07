import React, { useState } from 'react';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { ChevronLeft, Check } from 'lucide-react';

interface WatchMoodTrackerProps {
  onMoodSelected: (mood: string, emoji: string, moodCategory: string) => void;
  onBack: () => void;
}

interface MoodOption {
  mood: string;
  emoji: string;
  textColor: string;
  category: 'happy' | 'sad' | 'angry' | 'fear' | 'disgust' | 'surprise';
}

const moodOptions: MoodOption[] = [
  // 6 emotions to match iPhone version
  { mood: 'Happy', emoji: '😊', textColor: 'text-yellow-400', category: 'happy' },
  { mood: 'Sad', emoji: '😔', textColor: 'text-blue-400', category: 'sad' },
  { mood: 'Angry', emoji: '😡', textColor: 'text-red-400', category: 'angry' },
  { mood: 'Anxious', emoji: '😰', textColor: 'text-orange-400', category: 'fear' },
  { mood: 'Calm', emoji: '😌', textColor: 'text-green-400', category: 'surprise' },
  { mood: 'Overwhelmed', emoji: '😵‍💫', textColor: 'text-purple-400', category: 'disgust' },
];

export const WatchMoodTracker: React.FC<WatchMoodTrackerProps> = ({ 
  onMoodSelected, 
  onBack 
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);

  const handleMoodSelect = (option: MoodOption) => {
    setSelectedMood(option);
    
    // Auto-proceed after selection with slight delay
    setTimeout(() => {
      onMoodSelected(option.mood, option.emoji, option.category);
    }, 800);
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
          <h2 className="text-sm font-medium">How are you feeling?</h2>
          <p className="text-xs text-gray-400">Select your emotion</p>
        </div>
        <div className="w-6" /> {/* Spacer */}
      </div>



      {/* Mood Grid - 2x3 grid for 6 emotions */}
      <div className="grid grid-cols-2 gap-2 px-2">
        {moodOptions.map((option, index) => (
          <motion.button
            key={option.mood}
            onClick={() => handleMoodSelect(option)}
            disabled={selectedMood !== null}
            className={`
              relative aspect-square rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center
              ${selectedMood?.mood === option.mood 
                ? 'border-white bg-white/20 scale-95' 
                : 'border-gray-600 hover:border-gray-400 hover:bg-white/5'
              }
              ${selectedMood && selectedMood.mood !== option.mood ? 'opacity-30' : ''}
            `}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: selectedMood ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Emoji */}
            <div className="text-xl mb-0.5">{option.emoji}</div>
            
            {/* Label */}
            <span className={`text-xs font-medium ${option.textColor} text-center px-1`}>
              {option.mood}
            </span>

            {/* Selection Indicator */}
            {selectedMood?.mood === option.mood && (
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
        ))}
      </div>

      {/* Selection Feedback */}
      {selectedMood && (
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-lg">{selectedMood.emoji}</span>
            <span className="text-sm font-medium">{selectedMood.mood}</span>
          </div>
          <p className="text-xs text-gray-400">
            Next: Rate intensity
          </p>
        </motion.div>
      )}

      {/* Progress Dots */}
      <div className="flex justify-center gap-1 mt-4">
        <div className="w-2 h-2 bg-white rounded-full" />
        <div className="w-2 h-2 bg-gray-600 rounded-full" />
        <div className="w-2 h-2 bg-gray-600 rounded-full" />
        <div className="w-2 h-2 bg-gray-600 rounded-full" />
      </div>


    </div>
  );
};