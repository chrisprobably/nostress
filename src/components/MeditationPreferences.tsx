import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { CheckCircle2, Circle } from 'lucide-react';

interface MeditationPreferencesProps {
  onPreferencesSet: (preferences: UserMeditationPreferences) => void;
}

export interface UserMeditationPreferences {
  primaryStyle: 'breathing' | 'meditation' | 'music';
  priorExperience: ('breathing' | 'meditation' | 'music')[];
  backgroundMusic: boolean;
  sessionLength: 'short' | 'medium' | 'long'; // 10-15min / 15-25min / 25-35min
}

export const MeditationPreferences: React.FC<MeditationPreferencesProps> = ({ 
  onPreferencesSet 
}) => {
  const [primaryStyle, setPrimaryStyle] = useState<'breathing' | 'meditation' | 'music' | null>(null);
  const [priorExperience, setPriorExperience] = useState<('breathing' | 'meditation' | 'music')[]>([]);
  const [backgroundMusic, setBackgroundMusic] = useState(true);
  const [sessionLength, setSessionLength] = useState<'short' | 'medium' | 'long'>('medium');

  const styleOptions = [
    {
      id: 'breathing' as const,
      title: 'Breathing Focus',
      description: 'Deep breathing techniques to calm the nervous system',
      emoji: '🫁',
      benefits: ['Quick relaxation', 'Heart rate regulation', 'Anxiety relief']
    },
    {
      id: 'meditation' as const,
      title: 'Full Meditation',
      description: 'Complete mind-body practice with breathing, body scan, and imagery',
      emoji: '🧘‍♀️',
      benefits: ['Deep relaxation', 'Stress release', 'Mental clarity']
    },
    {
      id: 'music' as const,
      title: 'Music Relaxation',
      description: 'Gentle music with light breathing for peaceful sleep transition',
      emoji: '🎵',
      benefits: ['Ambient relaxation', 'Background calm', 'Easy practice']
    }
  ];

  const experienceOptions = [
    { id: 'breathing' as const, label: 'Breathing Exercises', emoji: '🫁' },
    { id: 'meditation' as const, label: 'Meditation Practice', emoji: '🧘‍♀️' },
    { id: 'music' as const, label: 'Music Relaxation', emoji: '🎵' }
  ];

  const lengthOptions = [
    { id: 'short' as const, label: 'Short', duration: '10-15 min', description: 'Quick wind-down' },
    { id: 'medium' as const, label: 'Medium', duration: '15-25 min', description: 'Balanced practice' },
    { id: 'long' as const, label: 'Long', duration: '25-35 min', description: 'Deep relaxation' }
  ];

  const toggleExperience = (experience: 'breathing' | 'meditation' | 'music') => {
    setPriorExperience(prev => 
      prev.includes(experience) 
        ? prev.filter(e => e !== experience)
        : [...prev, experience]
    );
  };

  const handleComplete = () => {
    if (!primaryStyle) return;
    
    onPreferencesSet({
      primaryStyle,
      priorExperience,
      backgroundMusic,
      sessionLength
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-blue-50 border-0">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
          <motion.div
            className="text-2xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🌙
          </motion.div>
        </div>
        <h2 className="mb-2 text-slate-800">Bedtime Meditation Setup</h2>
        <p className="text-muted-foreground">
          Let's personalize your nightly wind-down routine. We'll create a plan that adapts based on your daily stress levels.
        </p>
      </Card>

      {/* Primary Style Selection */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="mb-2">What's your preferred relaxation style?</h3>
          <p className="text-sm text-muted-foreground">Choose your primary approach - we can mix techniques based on your stress levels</p>
        </div>
        
        <div className="space-y-3">
          {styleOptions.map((style) => (
            <motion.div
              key={style.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`p-4 cursor-pointer transition-all border-2 ${
                  primaryStyle === style.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPrimaryStyle(style.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{style.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{style.title}</h4>
                      {primaryStyle === style.id && (
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{style.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {style.benefits.map((benefit) => (
                        <Badge key={benefit} variant="secondary" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Prior Experience */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="mb-2">Any prior experience with these practices?</h3>
          <p className="text-sm text-muted-foreground">Select all that apply - this helps us adjust guidance levels</p>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {experienceOptions.map((option) => (
            <Card
              key={option.id}
              className={`p-4 cursor-pointer transition-all border-2 ${
                priorExperience.includes(option.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleExperience(option.id)}
            >
              <div className="flex items-center gap-3">
                <div className="text-xl">{option.emoji}</div>
                <span className="flex-1">{option.label}</span>
                {priorExperience.includes(option.id) ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Session Length Preference */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="mb-2">Preferred session length?</h3>
          <p className="text-sm text-muted-foreground">We'll adjust based on your stress levels, but what's your baseline preference?</p>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {lengthOptions.map((option) => (
            <Card
              key={option.id}
              className={`p-4 cursor-pointer transition-all border-2 text-center ${
                sessionLength === option.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSessionLength(option.id)}
            >
              <div className="space-y-2">
                <h4 className="font-medium">{option.label}</h4>
                <p className="text-sm font-medium text-blue-600">{option.duration}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Background Music */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium mb-1">Background Music</h4>
            <p className="text-sm text-muted-foreground">Soft ambient sounds during sessions</p>
          </div>
          <Button
            variant={backgroundMusic ? "default" : "outline"}
            size="sm"
            onClick={() => setBackgroundMusic(!backgroundMusic)}
            className="min-w-[80px]"
          >
            {backgroundMusic ? "On" : "Off"}
          </Button>
        </div>
      </Card>

      {/* Complete Button */}
      <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto">
        <Button
          onClick={handleComplete}
          disabled={!primaryStyle}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-xl shadow-lg"
        >
          {primaryStyle ? "Complete Setup" : "Select your preferred style first"}
        </Button>
      </div>
    </div>
  );
};