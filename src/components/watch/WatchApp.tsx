import React, { useState } from 'react';
import { StressEvent, SleepData } from '../../App';
import { WatchOnboarding } from './WatchOnboarding';
import { WatchTrigger } from './WatchTrigger';
import { WatchMoodTracker } from './WatchMoodTracker';
import { WatchIntensityRating } from './WatchIntensityRating';
import { WatchCategoryTagger } from './WatchCategoryTagger';
import { WatchBreathingExercise } from './WatchBreathingExercise';
import { WatchSleepTracker } from './WatchSleepTracker';
import { WatchFeedback } from './WatchFeedback';

interface WatchAppProps {
  onEventCompleted: (event: StressEvent) => void;
  onViewOnPhone: () => void;
  sleepData?: SleepData[];
}

type WatchView = 'onboarding' | 'idle' | 'trigger' | 'mood' | 'intensity' | 'category' | 'breathing' | 'feedback' | 'sleep';

export const WatchApp: React.FC<WatchAppProps> = ({ onEventCompleted, onViewOnPhone, sleepData = [] }) => {
  const [currentView, setCurrentView] = useState<WatchView>('onboarding');
  const [pendingEvent, setPendingEvent] = useState<Partial<StressEvent> | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);

  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
    setCurrentView('idle');
  };

  const handleTriggerAlert = () => {
    setCurrentView('trigger');
  };

  const handleLogMood = () => {
    setPendingEvent({
      id: Date.now().toString(),
      timestamp: new Date()
    });
    setCurrentView('mood');
  };

  const handleSnooze = () => {
    setCurrentView('idle');
    // Set timeout for next alert (simulated)
    setTimeout(() => {
      if (Math.random() > 0.7) { // 30% chance of another alert
        setCurrentView('trigger');
      }
    }, 15 * 60 * 1000); // 15 minutes
  };

  const handleMoodSelected = (mood: string, emoji: string, moodCategory: string) => {
    if (pendingEvent) {
      setPendingEvent({
        ...pendingEvent,
        mood,
        moodEmoji: emoji,
        moodCategory
      });
      setCurrentView('intensity');
    }
  };

  const handleIntensitySelected = (intensity: number) => {
    if (pendingEvent) {
      setPendingEvent({
        ...pendingEvent,
        intensity
      });
      setCurrentView('category');
    }
  };

  const handleCategorySelected = (category: string, subcategory?: string) => {
    if (pendingEvent) {
      setPendingEvent({
        ...pendingEvent,
        category,
        subcategory
      });
      setCurrentView('breathing');
    }
  };

  const handleBreathingCompleted = () => {
    if (pendingEvent) {
      setPendingEvent({
        ...pendingEvent,
        completed: true
      });
      setCurrentView('feedback');
    }
  };

  const handleSessionComplete = () => {
    if (pendingEvent) {
      const newEvent: StressEvent = pendingEvent as StressEvent;
      onEventCompleted(newEvent);
      setPendingEvent(null);
      setCurrentView('idle');
    }
  };

  const handleViewDetails = () => {
    onViewOnPhone();
    handleSessionComplete();
  };

  const handleBackNavigation = () => {
    switch (currentView) {
      case 'mood':
        setCurrentView('trigger');
        break;
      case 'intensity':
        setCurrentView('mood');
        break;
      case 'category':
        setCurrentView('intensity');
        break;
      case 'breathing':
        setCurrentView('category');
        break;
      default:
        setCurrentView('idle');
    }
  };

  // Auto-trigger for demo purposes
  React.useEffect(() => {
    if (currentView === 'idle') {
      const timer = setTimeout(() => {
        if (Math.random() > 0.5) { // 50% chance
          setCurrentView('trigger');
        }
      }, 30000); // 30 seconds for demo
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  // Simulate HRV alerts - only trigger when HRV is abnormal
  React.useEffect(() => {
    if (isOnboarded && currentView === 'idle') {
      const interval = setInterval(() => {
        // Simulate HRV monitoring
        const hrvValue = Math.floor(Math.random() * 60) + 20; // 20-80ms range
        const isHRVAbnormal = hrvValue < 30 || hrvValue > 65; // Outside normal range
        
        if (isHRVAbnormal) {
          const now = new Date();
          const hour = now.getHours();
          
          // Higher chance during work hours
          const alertProbability = (hour >= 9 && hour <= 17) ? 0.4 : 0.2;
          
          if (Math.random() < alertProbability) {
            setCurrentView('trigger');
          }
        }
      }, 15 * 60 * 1000); // Check every 15 minutes
      
      return () => clearInterval(interval);
    }
  }, [isOnboarded, currentView]);

  const renderView = () => {
    switch (currentView) {
      case 'onboarding':
        return <WatchOnboarding onComplete={handleOnboardingComplete} />;
      case 'trigger':
        return (
          <WatchTrigger 
            onLogMood={handleLogMood}
            onSnooze={handleSnooze}
          />
        );
      case 'mood':
        return (
          <WatchMoodTracker 
            onMoodSelected={handleMoodSelected}
            onBack={handleBackNavigation}
          />
        );
      case 'intensity':
        return pendingEvent?.mood ? (
          <WatchIntensityRating
            mood={pendingEvent.mood}
            moodEmoji={pendingEvent.moodEmoji || ''}
            moodCategory={pendingEvent.moodCategory || ''}
            onIntensitySelected={handleIntensitySelected}
            onBack={handleBackNavigation}
          />
        ) : null;
      case 'category':
        return (
          <WatchCategoryTagger 
            onCategorySelected={handleCategorySelected}
            onBack={handleBackNavigation}
          />
        );
      case 'breathing':
        return (
          <WatchBreathingExercise 
            stressWord={pendingEvent?.category || 'stress'}
            onCompleted={handleBreathingCompleted}
            onBack={handleBackNavigation}
          />
        );
      case 'sleep':
        return (
          <WatchSleepTracker 
            sleepData={sleepData}
            onBack={() => setCurrentView('idle')}
          />
        );
      case 'feedback':
        return (
          <WatchFeedback 
            onComplete={handleSessionComplete}
            onViewDetails={handleViewDetails}
          />
        );
      default: // idle
        return (
          <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">💚</span>
              </div>
              <div>
                <h2 className="text-lg font-medium mb-1">HRV Normal</h2>
                <p className="text-sm text-gray-400">Monitoring your wellness</p>
              </div>
              
              {/* Quick Actions */}
              <div className="space-y-2 mt-6">
                <button
                  onClick={() => setCurrentView('sleep')}
                  className="w-full p-2 bg-blue-900/50 border border-blue-600 rounded-lg text-sm hover:bg-blue-900/70 transition-colors"
                >
                  🌙 Sleep Data
                </button>
                <button
                  onClick={handleTriggerAlert}
                  className="text-gray-500 hover:text-gray-300 transition-colors underline text-xs"
                >
                  Force Alert (Demo)
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-[200px] mx-auto bg-black rounded-[20px] overflow-hidden">
      {renderView()}
    </div>
  );
};