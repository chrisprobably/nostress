import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';

interface IntensityRatingProps {
  mood: string;
  moodEmoji: string;
  moodCategory: string;
  onIntensitySelected: (intensity: number) => void;
}

const getIntensityColor = (intensity: number, isSelected: boolean = false): string => {
  const colors = [
    // 1-2: Very light (minimal intensity)
    isSelected ? 'bg-green-200 border-green-400' : 'bg-green-50 hover:bg-green-100 border-green-200',
    isSelected ? 'bg-green-300 border-green-500' : 'bg-green-100 hover:bg-green-200 border-green-300',
    // 3-4: Light to moderate
    isSelected ? 'bg-yellow-200 border-yellow-400' : 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200',
    isSelected ? 'bg-yellow-300 border-yellow-500' : 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300',
    // 5-6: Moderate
    isSelected ? 'bg-orange-200 border-orange-400' : 'bg-orange-50 hover:bg-orange-100 border-orange-200',
    isSelected ? 'bg-orange-300 border-orange-500' : 'bg-orange-100 hover:bg-orange-200 border-orange-300',
    // 7-8: High intensity
    isSelected ? 'bg-red-200 border-red-400' : 'bg-red-50 hover:bg-red-100 border-red-200',
    isSelected ? 'bg-red-300 border-red-500' : 'bg-red-100 hover:bg-red-200 border-red-300',
    // 9-10: Very high intensity
    isSelected ? 'bg-red-400 border-red-600' : 'bg-red-200 hover:bg-red-300 border-red-400',
    isSelected ? 'bg-red-500 border-red-700' : 'bg-red-300 hover:bg-red-400 border-red-500',
  ];
  return colors[intensity - 1] || colors[0];
};

const getIntensityLabel = (intensity: number): string => {
  if (intensity <= 2) return 'Very Mild';
  if (intensity <= 4) return 'Mild';
  if (intensity <= 6) return 'Moderate';
  if (intensity <= 8) return 'Strong';
  return 'Very Strong';
};

export const IntensityRating: React.FC<IntensityRatingProps> = ({ 
  mood, 
  moodEmoji, 
  moodCategory, 
  onIntensitySelected 
}) => {
  const [selectedIntensity, setSelectedIntensity] = useState<number | null>(null);

  const handleIntensitySelect = (intensity: number) => {
    setSelectedIntensity(intensity);
  };

  const handleContinue = () => {
    if (selectedIntensity) {
      onIntensitySelected(selectedIntensity);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <Card className="p-6 text-center">
        <h2 className="mb-2">Rate Your Intensity</h2>
        <p className="text-muted-foreground mb-6">
          How intense is this feeling right now?
        </p>

        {/* Current Mood Display */}
        <div className="flex items-center justify-center gap-3 mb-6 p-4 bg-muted/30 rounded-lg">
          <span className="text-2xl">{moodEmoji}</span>
          <div className="text-left">
            <div className="font-medium">{mood}</div>
            <div className="text-sm text-muted-foreground capitalize">{moodCategory}</div>
          </div>
        </div>

        {/* Intensity Scale */}
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground mb-3">
            Select from 1 (very mild) to 10 (very strong)
          </div>
          
          {/* Number Scale */}
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }, (_, index) => {
              const intensity = index + 1;
              const isSelected = selectedIntensity === intensity;
              
              return (
                <motion.button
                  key={intensity}
                  onClick={() => handleIntensitySelect(intensity)}
                  className={`
                    aspect-square rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center
                    ${getIntensityColor(intensity, isSelected)}
                    ${isSelected ? 'scale-110 shadow-md' : 'hover:scale-105'}
                  `}
                  whileHover={{ scale: isSelected ? 1.1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="font-medium text-lg">{intensity}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Visual Intensity Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Very Mild</span>
              <span>Very Strong</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-300 via-yellow-400 via-orange-400 to-red-500 transition-all duration-300"
                style={{ 
                  width: selectedIntensity ? `${(selectedIntensity / 10) * 100}%` : '0%' 
                }}
              />
            </div>
          </div>
        </div>

        {/* Selection Feedback */}
        {selectedIntensity && (
          <motion.div
            className="mt-6 p-4 bg-muted/50 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-2xl">{moodEmoji}</span>
              <div>
                <span className="font-medium">{mood}</span>
                <div className="text-sm text-muted-foreground">
                  Intensity: {selectedIntensity}/10 - {getIntensityLabel(selectedIntensity)}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              You're feeling {mood.toLowerCase()} at a {getIntensityLabel(selectedIntensity).toLowerCase()} level. 
              Let's identify what might be contributing to this feeling.
            </p>
            <Button onClick={handleContinue} className="w-full">
              Continue to Categories
            </Button>
          </motion.div>
        )}
      </Card>

      {/* Quick Tips */}
      <Card className="p-6">
        <h3 className="mb-3">💡 Intensity Scale Guide</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>1-2:</span>
            <span>Barely noticeable, very mild</span>
          </div>
          <div className="flex justify-between">
            <span>3-4:</span>
            <span>Noticeable but manageable</span>
          </div>
          <div className="flex justify-between">
            <span>5-6:</span>
            <span>Moderate, affecting your day</span>
          </div>
          <div className="flex justify-between">
            <span>7-8:</span>
            <span>Strong, difficult to ignore</span>
          </div>
          <div className="flex justify-between">
            <span>9-10:</span>
            <span>Very intense, overwhelming</span>
          </div>
        </div>
      </Card>
    </div>
  );
};