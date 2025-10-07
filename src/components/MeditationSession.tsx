import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Play, SkipForward, Volume2, VolumeX, Moon } from 'lucide-react';
import { MeditationPlan, MeditationModule, MeditationFeedback, UserMeditationPreferences } from './BedroomMeditationPlan';
import { BreathingExercise } from './BreathingExercise';
import { BodyScanMeditation } from './BodyScanMeditation';
import { GuidedImagery } from './GuidedImagery';
import { MusicRelaxation } from './MusicRelaxation';
import { MeditationFeedback as FeedbackComponent } from './MeditationFeedback';
import { useDevice } from './DeviceContext';

interface MeditationSessionProps {
  plan: MeditationPlan;
  preferences: UserMeditationPreferences;
  startTime: Date;
  onCompleted: (feedback: MeditationFeedback) => void;
}

export const MeditationSession: React.FC<MeditationSessionProps> = ({
  plan,
  preferences,
  startTime,
  onCompleted
}) => {
  const { isPhone, isWatch } = useDevice();
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [moduleProgress, setModuleProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [backgroundMusic, setBackgroundMusic] = useState(preferences.backgroundMusic);
  const [sessionStartTime] = useState(startTime);

  const currentModule = plan.modules[currentModuleIndex];
  const totalModules = plan.modules.length;

  // Calculate overall session progress
  useEffect(() => {
    const completedDuration = plan.modules
      .slice(0, currentModuleIndex)
      .reduce((sum, module) => sum + module.duration, 0);
    
    const currentModuleDuration = currentModule ? currentModule.duration : 0;
    const currentModuleCompleted = (moduleProgress / 100) * currentModuleDuration;
    
    const totalProgress = completedDuration + currentModuleCompleted;
    const overallProgress = (totalProgress / plan.totalDuration) * 100;
    
    setSessionProgress(Math.min(overallProgress, 100));
  }, [currentModuleIndex, moduleProgress, plan.modules, plan.totalDuration, currentModule]);

  const handleModuleCompleted = () => {
    if (currentModule) {
      setCompletedModules(prev => [...prev, currentModule.id]);
    }
    
    if (currentModuleIndex < totalModules - 1) {
      setCurrentModuleIndex(prev => prev + 1);
      setModuleProgress(0);
    } else {
      setIsComplete(true);
    }
  };

  const handleSkipModule = () => {
    handleModuleCompleted();
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleSessionComplete = (feedback: MeditationFeedback) => {
    const sessionDuration = (new Date().getTime() - sessionStartTime.getTime()) / (1000 * 60);
    
    const finalFeedback: MeditationFeedback = {
      ...feedback,
      completedModules,
      sessionDuration: Math.round(sessionDuration)
    };
    
    onCompleted(finalFeedback);
  };

  const renderCurrentModule = () => {
    if (!currentModule) return null;

    const moduleProps = {
      module: currentModule,
      isPlaying: isPlaying && !isPaused,
      backgroundMusic,
      onProgress: setModuleProgress,
      onCompleted: handleModuleCompleted,
      onPause: handlePauseResume
    };

    switch (currentModule.type) {
      case 'breathing':
        return (
          <BreathingExercise
            stressWord="relaxation"
            onCompleted={handleModuleCompleted}
            // Add meditation-specific props
            duration={currentModule.duration}
            isEmbedded={true}
            backgroundMusic={backgroundMusic}
          />
        );
      
      case 'body_scan':
        return <BodyScanMeditation {...moduleProps} />;
      
      case 'imagery':
        return <GuidedImagery {...moduleProps} />;
      
      case 'nature_sounds':
        return <MusicRelaxation {...moduleProps} />;
      
      default:
        return null;
    }
  };

  if (isComplete) {
    return (
      <FeedbackComponent
        plan={plan}
        completedModules={completedModules}
        sessionDuration={(new Date().getTime() - sessionStartTime.getTime()) / (1000 * 60)}
        onSubmit={handleSessionComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900 text-white relative">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5" />
              <span className="text-sm font-medium">
                {currentModule?.title} • {currentModuleIndex + 1}/{totalModules}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBackgroundMusic(!backgroundMusic)}
                className="p-2 text-white/70 hover:text-white"
              >
                {backgroundMusic ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePauseResume}
                className="p-2 text-white/70 hover:text-white"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
              
              {currentModule?.isOptional && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipModule}
                  className="p-2 text-white/70 hover:text-white"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/60">
              <span>Session Progress</span>
              <span>{Math.round(sessionProgress)}%</span>
            </div>
            <Progress value={sessionProgress} className="h-1 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Module Navigation */}
      <div className="fixed top-20 left-0 right-0 z-40">
        <div className="max-w-md mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {plan.modules.map((module, index) => (
              <div
                key={module.id}
                className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium transition-all ${
                  index === currentModuleIndex
                    ? 'bg-white/20 text-white border border-white/30'
                    : index < currentModuleIndex
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-white/10 text-white/60 border border-white/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  {index < currentModuleIndex && <span>✓</span>}
                  <span>{module.title}</span>
                  <span className="text-white/40">{module.duration}m</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentModule?.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="px-4"
          >
            {renderCurrentModule()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pause Overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <Card className="p-6 text-center max-w-sm mx-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                <Pause className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-2 text-slate-800">Session Paused</h3>
              <p className="text-muted-foreground mb-6">
                Take your time. Resume when you're ready to continue.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handlePauseResume}
                  className="w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume Session
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSkipModule}
                  className="w-full"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip to Next Module
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Music Indicator */}
      {backgroundMusic && (
        <div className="fixed bottom-4 right-4 z-40">
          <motion.div
            className="bg-black/20 backdrop-blur-sm rounded-full p-3 border border-white/20"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Volume2 className="w-4 h-4 text-white/70" />
          </motion.div>
        </div>
      )}
    </div>
  );
};