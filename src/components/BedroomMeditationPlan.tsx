import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Heart, Brain, Music, Clock, ChevronRight, Star } from 'lucide-react';
import { MeditationPreferences, UserMeditationPreferences } from './MeditationPreferences';
import { MeditationSession } from './MeditationSession';
import { useDevice } from './DeviceContext';

interface BedroomMeditationPlanProps {
  stressCountToday: number;
  hrvToday?: number;
  hrvBaseline?: number;
  hasBaseline: boolean;
  onCompleted: (feedback: MeditationFeedback) => void;
}

export interface MeditationFeedback {
  effectiveness: 'good' | 'okay' | 'want_change';
  fellAsleepDuring?: 'breathing' | 'body_scan' | 'imagery' | 'nature_sounds' | null;
  completedModules: string[];
  sessionDuration: number; // actual duration in minutes
  stressLevelAfter: number; // 1-10 scale
}

export interface MeditationPlan {
  stressLevel: 'high' | 'medium' | 'low';
  modules: MeditationModule[];
  totalDuration: number;
  message: string;
  recommendedTime: string;
}

export interface MeditationModule {
  id: string;
  type: 'breathing' | 'body_scan' | 'imagery' | 'nature_sounds';
  duration: number; // minutes
  title: string;
  description: string;
  techniques?: string[];
  isOptional?: boolean;
}

export const BedroomMeditationPlan: React.FC<BedroomMeditationPlanProps> = ({
  stressCountToday,
  hrvToday,
  hrvBaseline,
  hasBaseline,
  onCompleted
}) => {
  const { isPhone, isWatch } = useDevice();
  const [preferences, setPreferences] = useState<UserMeditationPreferences | null>(null);
  const [currentPlan, setCurrentPlan] = useState<MeditationPlan | null>(null);
  const [isInSession, setIsInSession] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('meditation_preferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  // Generate plan when preferences are available
  useEffect(() => {
    if (preferences && !currentPlan) {
      const plan = generateMeditationPlan(stressCountToday, preferences, hrvToday, hrvBaseline, hasBaseline);
      setCurrentPlan(plan);
    }
  }, [preferences, stressCountToday, hrvToday, hrvBaseline, hasBaseline, currentPlan]);

  const handlePreferencesSet = (newPreferences: UserMeditationPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('meditation_preferences', JSON.stringify(newPreferences));
  };

  const assessStressLevel = (
    stressCount: number, 
    hrvToday?: number, 
    hrvBaseline?: number, 
    hasBaseline: boolean = false
  ): 'high' | 'medium' | 'low' => {
    // Primary assessment: stress count from sensor clustering
    if (stressCount >= 10) return 'high';
    if (stressCount >= 5) return 'medium';
    if (stressCount >= 0) return 'low';

    // Fallback: HRV-based assessment if stress count unavailable
    if (hasBaseline && hrvToday && hrvBaseline) {
      const ratio = hrvToday / hrvBaseline;
      if (ratio <= 0.8) return 'high';
      if (ratio < 0.95) return 'medium';
      return 'low';
    }

    // Default to medium if no data
    return 'medium';
  };

  const generateMeditationPlan = (
    stressCount: number,
    userPrefs: UserMeditationPreferences,
    hrvToday?: number,
    hrvBaseline?: number,
    hasBaseline: boolean = false
  ): MeditationPlan => {
    const stressLevel = assessStressLevel(stressCount, hrvToday, hrvBaseline, hasBaseline);
    
    // Base plans by stress level
    const basePlans = {
      high: {
        breathing: { duration: 12, priority: 1 },
        body_scan: { duration: 8, priority: 2 },
        nature_sounds: { duration: 5, priority: 3 },
        imagery: { duration: 0, priority: 4 }
      },
      medium: {
        breathing: { duration: 5, priority: 1 },
        body_scan: { duration: 10, priority: 2 },
        imagery: { duration: 8, priority: 3 },
        nature_sounds: { duration: 5, priority: 4 }
      },
      low: {
        breathing: { duration: 3, priority: 3 },
        imagery: { duration: 10, priority: 1 },
        nature_sounds: { duration: 7, priority: 2 },
        body_scan: { duration: 0, priority: 4, optional: true }
      }
    };

    const basePlan = basePlans[stressLevel];
    const modules: MeditationModule[] = [];

    // Adjust based on user preferences
    if (userPrefs.primaryStyle === 'breathing') {
      // Increase breathing, add natural sound background
      if (basePlan.breathing.duration > 0) {
        modules.push({
          id: 'breathing',
          type: 'breathing',
          duration: Math.min(basePlan.breathing.duration + 3, 15),
          title: 'Deep Breathing Practice',
          description: 'Calming breath work to regulate your nervous system',
          techniques: ['coherent', 'exhalation_emphasis']
        });
      }
      if (basePlan.body_scan.duration > 0) {
        modules.push({
          id: 'body_scan',
          type: 'body_scan',
          duration: basePlan.body_scan.duration,
          title: 'Body Relaxation',
          description: 'Progressive muscle relaxation and body awareness',
          isOptional: stressLevel === 'low'
        });
      }
      if (userPrefs.backgroundMusic) {
        modules.push({
          id: 'nature_sounds',
          type: 'nature_sounds',
          duration: 5,
          title: 'Natural Soundscapes',
          description: 'Soothing natural sounds and white noise to ease into sleep',
          isOptional: true
        });
      }
    } else if (userPrefs.primaryStyle === 'meditation') {
      // Full three-stage meditation
      if (basePlan.breathing.duration > 0) {
        modules.push({
          id: 'breathing',
          type: 'breathing',
          duration: basePlan.breathing.duration,
          title: 'Centering Breath',
          description: 'Foundation breathing to center your mind',
          techniques: ['coherent']
        });
      }
      modules.push({
        id: 'body_scan',
        type: 'body_scan',
        duration: basePlan.body_scan.duration || 8,
        title: 'Body Scan Meditation',
        description: 'Systematic relaxation from head to toe'
      });
      if (basePlan.imagery.duration > 0 || stressLevel !== 'high') {
        modules.push({
          id: 'imagery',
          type: 'imagery',
          duration: Math.max(basePlan.imagery.duration, 8),
          title: 'Guided Nature Imagery',
          description: 'Peaceful natural scene visualization for deep relaxation'
        });
      }
    } else if (userPrefs.primaryStyle === 'music') {
      // Natural sounds-focused with light breathing
      modules.push({
        id: 'breathing',
        type: 'breathing',
        duration: Math.min(basePlan.breathing.duration, 5),
        title: 'Gentle Breathing',
        description: 'Light breathing practice with natural ambient sounds',
        techniques: ['coherent']
      });
      modules.push({
        id: 'imagery',
        type: 'imagery',
        duration: Math.max(basePlan.imagery.duration, 10),
        title: 'Natural Scene Visualization',
        description: 'Immersive guided imagery through peaceful natural environments'
      });
      modules.push({
        id: 'nature_sounds',
        type: 'nature_sounds',
        duration: Math.max(basePlan.nature_sounds.duration, 8),
        title: 'Nature Soundscapes',
        description: 'Soothing natural sounds and white noise for peaceful sleep transition'
      });
    }

    // Adjust for session length preference
    const lengthMultipliers = { short: 0.8, medium: 1.0, long: 1.3 };
    const multiplier = lengthMultipliers[userPrefs.sessionLength];
    
    modules.forEach(module => {
      module.duration = Math.round(module.duration * multiplier);
    });

    const totalDuration = modules.reduce((sum, module) => sum + module.duration, 0);

    const messages = {
      high: `Detected ${stressCount} stress events today. Tonight's plan focuses on deep breathing and body relaxation to help restore your nervous system.`,
      medium: `Moderate stress levels detected (${stressCount} events). A balanced approach of breathing and meditation will help you transition peacefully to sleep.`,
      low: `Low stress day (${stressCount} events). Light breathing with natural sounds and visualization will gently guide you into restful sleep.`
    };

    return {
      stressLevel,
      modules,
      totalDuration,
      message: messages[stressLevel],
      recommendedTime: 'Best started 30-60 minutes before intended sleep'
    };
  };

  const handleStartSession = () => {
    setIsInSession(true);
    setSessionStartTime(new Date());
  };

  const handleSessionCompleted = (feedback: MeditationFeedback) => {
    setIsInSession(false);
    setSessionStartTime(null);
    onCompleted(feedback);
  };

  const getStressLevelColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getStressLevelIcon = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
    }
  };

  // Show preferences setup if not set
  if (!preferences) {
    return <MeditationPreferences onPreferencesSet={handlePreferencesSet} />;
  }

  // Show meditation session if in progress
  if (isInSession && currentPlan && sessionStartTime) {
    return (
      <MeditationSession
        plan={currentPlan}
        preferences={preferences}
        startTime={sessionStartTime}
        onCompleted={handleSessionCompleted}
      />
    );
  }

  // Show plan overview
  if (!currentPlan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-2xl"
            >
              🌙
            </motion.div>
          </div>
          <p className="text-muted-foreground">Generating your personalized plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header with stress assessment */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-0">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Moon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="mb-1">Tonight's Meditation Plan</h2>
            <div className="flex items-center gap-2">
              <Badge className={`${getStressLevelColor(currentPlan.stressLevel)} border`}>
                {getStressLevelIcon(currentPlan.stressLevel)} {currentPlan.stressLevel.toUpperCase()} stress
              </Badge>
              <span className="text-sm text-muted-foreground">
                {stressCountToday} events detected today
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          {currentPlan.message}
        </p>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>{currentPlan.totalDuration} minutes total</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-purple-600" />
            <span>{preferences.primaryStyle} focused</span>
          </div>
        </div>
      </Card>

      {/* Plan modules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3>Session Overview</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreferences(null)}
            className="text-xs"
          >
            Change Preferences
          </Button>
        </div>

        {currentPlan.modules.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {index + 1}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{module.title}</h4>
                    {module.isOptional && (
                      <Badge variant="outline" className="text-xs">Optional</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>{module.duration} min</span>
                      </div>
                      
                      {module.type === 'breathing' && (
                        <div className="flex items-center gap-2 text-sm">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span>HRV sync</span>
                        </div>
                      )}
                      
                      {module.type === 'music' && preferences.backgroundMusic && (
                        <div className="flex items-center gap-2 text-sm">
                          <Music className="w-4 h-4 text-purple-600" />
                          <span>Ambient</span>
                        </div>
                      )}
                      
                      {module.type === 'body_scan' && (
                        <div className="flex items-center gap-2 text-sm">
                          <Brain className="w-4 h-4 text-green-600" />
                          <span>Progressive</span>
                        </div>
                      )}
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recommendation note */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            💡
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Timing Recommendation</h4>
            <p className="text-sm text-blue-700">{currentPlan.recommendedTime}</p>
          </div>
        </div>
      </Card>

      {/* Start session button */}
      <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto">
        <Button
          onClick={handleStartSession}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl shadow-lg text-lg"
        >
          <Moon className="w-5 h-5 mr-2" />
          Begin Tonight's Session
        </Button>
      </div>
    </div>
  );
};